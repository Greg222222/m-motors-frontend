import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import Catalogue from './Catalogue'

vi.mock('../api', () => ({ api: { get: vi.fn() } }))

function renderCatalogue() {
  return render(
    <MemoryRouter>
      <Catalogue />
    </MemoryRouter>,
  )
}

const SAMPLE_VEHICLE = {
  id: 1,
  brand: 'Renault',
  model: 'Clio',
  year: 2022,
  mileage: 1000,
  description: 'Petite citadine économique.',
  image_url: null,
  is_engaged: false,
  price_sale: 9000,
  price_rent_monthly: null,
}

describe('Catalogue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists vehicles returned by the API as clickable cards', async () => {
    api.get.mockResolvedValueOnce({ data: [SAMPLE_VEHICLE] })

    renderCatalogue()

    expect(await screen.findByRole('link', { name: /Renault Clio/ })).toHaveAttribute('href', '/vehicules/1')
    expect(api.get).toHaveBeenCalledWith('/vehicles', { params: {} })
  })

  it('shows a "Réservé" badge for an already engaged vehicle', async () => {
    api.get.mockResolvedValueOnce({ data: [{ ...SAMPLE_VEHICLE, is_engaged: true }] })

    renderCatalogue()

    expect(await screen.findByText('Réservé')).toBeInTheDocument()
  })

  it('requests the rent filter when "Location" is clicked', async () => {
    api.get.mockResolvedValue({ data: [] })
    const user = userEvent.setup()

    renderCatalogue()
    await user.click(screen.getByRole('button', { name: 'Location' }))

    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/vehicles', { params: { mode: 'rent' } }))
  })

  it('shows an error message when the catalogue cannot be loaded', async () => {
    api.get.mockRejectedValueOnce(new Error('network error'))

    renderCatalogue()

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger le catalogue.')
  })
})
