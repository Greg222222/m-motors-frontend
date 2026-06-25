import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import BackOffice from './BackOffice'

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }))

describe('BackOffice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockImplementation((url) => {
      if (url === '/vehicles') {
        return Promise.resolve({
          data: [{ id: 1, brand: 'Renault', model: 'Clio', mode: 'sale', is_engaged: false }],
        })
      }
      return Promise.resolve({
        data: [{ id: 1, type: 'achat', status: 'en_attente', refusal_reason: null }],
      })
    })
  })

  it('adds a vehicle to the catalogue (US-04)', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 2 } })
    const user = userEvent.setup()

    render(<BackOffice />)
    await screen.findByText(/Renault Clio/)

    await user.type(screen.getByPlaceholderText('Marque'), 'Peugeot')
    await user.type(screen.getByPlaceholderText('Modèle'), '208')
    await user.type(screen.getByPlaceholderText('Kilométrage'), '5000')
    await user.type(screen.getByPlaceholderText('Prix vente (€)'), '8000')
    await user.click(screen.getByRole('button', { name: 'Ajouter' }))

    expect(api.post).toHaveBeenCalledWith('/vehicles', expect.objectContaining({ brand: 'Peugeot', model: '208' }))
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
    api.get.mockImplementation((url) => {
      if (url === '/vehicles') {
        return Promise.resolve({
          data: [{ id: 1, brand: 'Renault', model: 'Clio', mode: 'sale', is_engaged: true }],
        })
      }
      return Promise.resolve({ data: [] })
    })

    render(<BackOffice />)
    const toggleButton = await screen.findByRole('button', { name: /Basculer en Location/ })
    expect(toggleButton).toBeDisabled()
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
