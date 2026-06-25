import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import { getPendingIntent } from '../dossierIntent'
import VehicleDetail from './VehicleDetail'

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))
vi.mock('../AuthContext', () => ({ useAuth: vi.fn() }))

const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ id: '1' }),
}))

const VEHICLE = {
  id: 1,
  brand: 'Renault',
  model: 'Clio',
  year: 2022,
  mileage: 15000,
  color: 'Bleu',
  fuel_type: 'essence',
  description: 'Petite citadine économique.',
  image_url: null,
  is_engaged: false,
  price_sale: 9000,
  price_rent_monthly: 220,
  mode: 'both',
}

describe('VehicleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('renders the vehicle characteristics fetched from the API', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false })
    api.get.mockResolvedValueOnce({ data: VEHICLE })

    render(<VehicleDetail />)

    expect(await screen.findByText(/Renault Clio \(2022\)/)).toBeInTheDocument()
    expect(screen.getByText('Petite citadine économique.')).toBeInTheDocument()
    expect(screen.getByText(/15 000 km/)).toBeInTheDocument()
  })

  it('shows an error when the vehicle does not exist', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false })
    api.get.mockRejectedValueOnce(new Error('not found'))

    render(<VehicleDetail />)

    expect(await screen.findByRole('alert')).toHaveTextContent(/n'existe pas/)
  })

  it('redirects an anonymous visitor to /auth and remembers the intent', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false })
    api.get.mockResolvedValueOnce({ data: VEHICLE })
    const user = userEvent.setup()

    render(<VehicleDetail />)
    await user.click(await screen.findByRole('button', { name: "Demander à l'achat" }))

    expect(navigateMock).toHaveBeenCalledWith('/auth')
    expect(getPendingIntent()).toEqual({ vehicleId: 1, type: 'achat' })
    expect(api.post).not.toHaveBeenCalled()
  })

  it('creates the dossier directly when already authenticated', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true })
    api.get.mockResolvedValueOnce({ data: VEHICLE })
    api.post.mockResolvedValueOnce({ data: { id: 1 } })
    const user = userEvent.setup()

    render(<VehicleDetail />)
    await user.click(await screen.findByRole('button', { name: 'Demander en location' }))

    expect(api.post).toHaveBeenCalledWith('/dossiers', { vehicle_id: 1, type: 'location' })
    expect(navigateMock).toHaveBeenCalledWith('/espace-client')
  })

  it('hides the request buttons and shows a notice when the vehicle is already engaged', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true })
    api.get.mockResolvedValueOnce({ data: { ...VEHICLE, is_engaged: true } })

    render(<VehicleDetail />)

    expect(await screen.findByText(/dossier en cours/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: "Demander à l'achat" })).not.toBeInTheDocument()
  })

  it('only shows the matching CTA for a sale-only vehicle', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true })
    api.get.mockResolvedValueOnce({ data: { ...VEHICLE, mode: 'sale' } })

    render(<VehicleDetail />)

    await screen.findByRole('button', { name: "Demander à l'achat" })
    expect(screen.queryByRole('button', { name: 'Demander en location' })).not.toBeInTheDocument()
  })
})
