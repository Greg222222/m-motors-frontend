import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import Catalogue from './Catalogue'

vi.mock('../api', () => ({ api: { get: vi.fn() } }))

describe('Catalogue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists vehicles returned by the API', async () => {
    api.get.mockResolvedValueOnce({
      data: [{ id: 1, brand: 'Renault', model: 'Clio', mileage: 1000, price_sale: 9000, price_rent_monthly: null }],
    })

    render(<Catalogue />)

    expect(await screen.findByText(/Renault Clio/)).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/vehicles', { params: {} })
  })

  it('requests the rent filter when "Location" is clicked', async () => {
    api.get.mockResolvedValue({ data: [] })
    const user = userEvent.setup()

    render(<Catalogue />)
    await user.click(screen.getByRole('button', { name: 'Location' }))

    await waitFor(() => expect(api.get).toHaveBeenLastCalledWith('/vehicles', { params: { mode: 'rent' } }))
  })

  it('shows an error message when the catalogue cannot be loaded', async () => {
    api.get.mockRejectedValueOnce(new Error('network error'))

    render(<Catalogue />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger le catalogue.')
  })
})
