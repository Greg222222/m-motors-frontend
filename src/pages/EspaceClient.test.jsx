import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import EspaceClient from './EspaceClient'

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

describe('EspaceClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockResolvedValue({
      data: [{ id: 1, type: 'location', status: 'en_attente', refusal_reason: null }],
    })
  })

  it('shows the real-time status of the client dossiers (US-03)', async () => {
    render(<EspaceClient />)
    const trackingSection = (await screen.findByText('Suivi de mes dossiers')).closest('section')
    expect(within(trackingSection).getByText(/Dossier #1/)).toBeInTheDocument()
    expect(within(trackingSection).getByText('en_attente')).toBeInTheDocument()
  })

  it('uploads a supporting document for the selected dossier (US-02)', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } })
    const user = userEvent.setup()

    render(<EspaceClient />)
    await screen.findByText('Suivi de mes dossiers')

    await user.selectOptions(screen.getByRole('combobox'), '1')
    const file = new File(['contenu'], 'piece.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Choisir un fichier à uploader'), file)
    await user.click(screen.getByRole('button', { name: 'Uploader le dossier' }))

    expect(api.post).toHaveBeenCalledWith('/documents/1', expect.any(FormData), expect.any(Object))
  })
})
