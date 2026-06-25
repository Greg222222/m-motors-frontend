import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import BackOffice from './BackOffice'

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }))

const VEHICLE = {
  id: 1,
  brand: 'Renault',
  model: 'Clio',
  year: 2022,
  color: 'Bleu',
  fuel_type: 'essence',
  mode: 'sale',
  is_engaged: false,
}

const DOSSIER = {
  id: 1,
  type: 'achat',
  status: 'en_attente',
  refusal_reason: null,
  vehicle: VEHICLE,
  user: { id: 2, email: 'client@example.com' },
}

function mockApiGet({ vehicles = [VEHICLE], dossiers = [DOSSIER], documents = [] } = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/vehicles') return Promise.resolve({ data: vehicles })
    if (url === '/dossiers') return Promise.resolve({ data: dossiers })
    if (url.startsWith('/documents/')) return Promise.resolve({ data: documents })
    return Promise.resolve({ data: [] })
  })
}

describe('BackOffice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiGet()
  })

  it('adds a vehicle to the catalogue with its full characteristics (US-04)', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 2 } })
    const user = userEvent.setup()

    render(<BackOffice />)
    await screen.findAllByText(/Renault Clio/)

    await user.type(screen.getByPlaceholderText('Marque'), 'Peugeot')
    await user.type(screen.getByPlaceholderText('Modèle'), '208')
    await user.clear(screen.getByPlaceholderText('Année'))
    await user.type(screen.getByPlaceholderText('Année'), '2023')
    await user.type(screen.getByPlaceholderText('Kilométrage'), '5000')
    await user.type(screen.getByPlaceholderText('Couleur'), 'Rouge')
    await user.type(screen.getByPlaceholderText('Prix vente (€)'), '8000')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))

    expect(api.post).toHaveBeenCalledWith(
      '/vehicles',
      expect.objectContaining({ brand: 'Peugeot', model: '208', year: 2023, color: 'Rouge' }),
    )
  })

  it("shows the vehicle's characteristics in the fleet list (US-04)", async () => {
    render(<BackOffice />)

    const fleetSection = (await screen.findByText('Parc automobile')).closest('section')
    expect(within(fleetSection).getByText(/Renault Clio \(2022\)/)).toBeInTheDocument()
    expect(within(fleetSection).getByText(/Bleu.*essence/)).toBeInTheDocument()
  })

  it('toggles a vehicle from Sale to Rent when not engaged (US-05)', async () => {
    api.patch.mockResolvedValueOnce({ data: {} })
    const user = userEvent.setup()

    render(<BackOffice />)
    const toggleButton = await screen.findByRole('button', { name: /Basculer en Location/ })
    await user.click(toggleButton)

    expect(api.patch).toHaveBeenCalledWith('/vehicles/1/mode', { mode: 'rent' })
  })

  it('disables the toggle button when the vehicle is engaged', async () => {
    mockApiGet({ vehicles: [{ ...VEHICLE, is_engaged: true }] })

    render(<BackOffice />)
    const toggleButton = await screen.findByRole('button', { name: /Basculer en Location/ })
    expect(toggleButton).toBeDisabled()
  })

  it('shows the client email and lets the admin open an uploaded document (US-06)', async () => {
    mockApiGet({ documents: [{ id: 9, filename: 'piece.pdf' }] })

    render(<BackOffice />)

    expect(await screen.findByText(/client@example\.com/)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'piece.pdf' })).toBeInTheDocument()
  })

  it('validates a pending dossier (US-06)', async () => {
    api.post.mockResolvedValueOnce({ data: {} })
    const user = userEvent.setup()

    render(<BackOffice />)
    const validateButton = await screen.findByRole('button', { name: 'Valider' })
    await user.click(validateButton)

    expect(api.post).toHaveBeenCalledWith('/dossiers/1/decision', { approve: true, refusal_reason: undefined })
  })
})
