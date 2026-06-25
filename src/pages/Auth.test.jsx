import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api, setAuthToken } from '../api'
import { useAuth } from '../AuthContext'
import { setPendingIntent } from '../dossierIntent'
import Auth from './Auth'

vi.mock('../api', () => ({ api: { post: vi.fn() }, setAuthToken: vi.fn() }))
vi.mock('../AuthContext', () => ({ useAuth: vi.fn() }))

const navigateMock = vi.fn()
vi.mock('react-router-dom', () => ({ useNavigate: () => navigateMock }))

describe('Auth', () => {
  const loginMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    useAuth.mockReturnValue({ login: loginMock })
  })

  it('logs the user in and redirects to the client space', async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: 'fake-token' } })
    const user = userEvent.setup()

    render(<Auth />)
    await user.type(screen.getByLabelText('Email'), 'client@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'Password123')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(api.post).toHaveBeenCalledWith('/auth/login', expect.any(URLSearchParams))
    expect(setAuthToken).toHaveBeenCalledWith('fake-token')
    expect(loginMock).toHaveBeenCalledWith('fake-token')
    expect(navigateMock).toHaveBeenCalledWith('/espace-client')
  })

  it('creates the pending dossier and clears the intent after login', async () => {
    setPendingIntent(7, 'achat')
    api.post.mockResolvedValueOnce({ data: { access_token: 'fake-token' } }).mockResolvedValueOnce({ data: {} })
    const user = userEvent.setup()

    render(<Auth />)
    await user.type(screen.getByLabelText('Email'), 'client@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'Password123')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(api.post).toHaveBeenNthCalledWith(2, '/dossiers', { vehicle_id: 7, type: 'achat' })
    expect(sessionStorage.getItem('pendingDossierIntent')).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith('/espace-client')
  })

  it('shows the server error message when login fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { detail: 'Invalid credentials' } } })
    const user = userEvent.setup()

    render(<Auth />)
    await user.type(screen.getByLabelText('Email'), 'client@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'WrongPassword')
    await user.click(screen.getByRole('button', { name: 'Se connecter' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
  })

  it('switches to the registration form and calls register before login', async () => {
    api.post.mockResolvedValueOnce({ data: {} }).mockResolvedValueOnce({ data: { access_token: 'tok' } })
    const user = userEvent.setup()

    render(<Auth />)
    await user.click(screen.getByRole('button', { name: "Pas de compte ? S'inscrire" }))
    await user.type(screen.getByLabelText('Email'), 'new@example.com')
    await user.type(screen.getByLabelText('Mot de passe'), 'Password123')
    await user.click(screen.getByRole('button', { name: "S'inscrire" }))

    expect(api.post).toHaveBeenNthCalledWith(1, '/auth/register', {
      email: 'new@example.com',
      password: 'Password123',
    })
  })
})
