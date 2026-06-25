import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api'
import EspaceClient from './EspaceClient'

vi.mock('../api', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

const DOSSIER = {
  id: 1,
  type: 'location',
  status: 'en_attente',
  refusal_reason: null,
  vehicle: { id: 9, brand: 'Renault', model: 'Clio', year: 2022, image_url: null },
}

function mockApiGet({ dossiers = [DOSSIER], documents = [] } = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/dossiers/me') return Promise.resolve({ data: dossiers })
    if (url.startsWith('/documents/')) return Promise.resolve({ data: documents })
    return Promise.resolve({ data: [] })
  })
}

describe('EspaceClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the real-time status of the client dossiers with the vehicle name (US-03)', async () => {
    mockApiGet()
    render(<EspaceClient />)

    expect(await screen.findByText(/Renault Clio \(2022\)/)).toBeInTheDocument()
    expect(screen.getByText(/Dossier #1/)).toBeInTheDocument()
    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('shows the refusal reason when a dossier was refused', async () => {
    mockApiGet({ dossiers: [{ ...DOSSIER, status: 'refuse', refusal_reason: 'Dossier incomplet' }] })
    render(<EspaceClient />)

    expect(await screen.findByText(/Dossier incomplet/)).toBeInTheDocument()
  })

  it('lists already uploaded documents for a dossier', async () => {
    mockApiGet({ documents: [{ id: 5, filename: 'piece.pdf', content_type: 'application/pdf' }] })
    render(<EspaceClient />)

    expect(await screen.findByRole('button', { name: 'piece.pdf' })).toBeInTheDocument()
  })

  it('uploads a supporting document for a dossier still pending (US-02)', async () => {
    mockApiGet()
    api.post.mockResolvedValueOnce({ data: { id: 1 } })
    const user = userEvent.setup()

    render(<EspaceClient />)
    await screen.findByRole("heading", { name: /Renault Clio/ })

    const file = new File(['contenu'], 'piece.pdf', { type: 'application/pdf' })
    await user.upload(screen.getByLabelText('Choisir un fichier à uploader'), file)
    await user.click(screen.getByRole('button', { name: 'Uploader le dossier' }))

    expect(api.post).toHaveBeenCalledWith('/documents/1', expect.any(FormData), expect.any(Object))
  })

  it('does not allow uploading once the dossier has been decided', async () => {
    mockApiGet({ dossiers: [{ ...DOSSIER, status: 'valide' }] })
    render(<EspaceClient />)

    await screen.findByRole("heading", { name: /Renault Clio/ })
    expect(screen.queryByLabelText('Choisir un fichier à uploader')).not.toBeInTheDocument()
  })

  it('invites the client to browse the catalogue when there is no dossier yet', async () => {
    mockApiGet({ dossiers: [] })
    render(<EspaceClient />)

    expect(await screen.findByText(/Parcourez le catalogue/)).toBeInTheDocument()
  })
})
