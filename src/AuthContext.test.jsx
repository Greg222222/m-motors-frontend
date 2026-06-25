import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthToken } from './api'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('./api', () => ({ setAuthToken: vi.fn() }))

function encodeToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

function Probe() {
  const { isAuthenticated, role, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? `connected:${role}` : 'anonymous'}</span>
      <button onClick={() => login(encodeToken({ sub: 'admin@m-motors.fr', role: 'admin' }))}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('starts anonymous when there is no stored token', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
  })

  it('decodes the role from the JWT on login and persists the token', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'login' }))

    expect(screen.getByTestId('status')).toHaveTextContent('connected:admin')
    expect(localStorage.getItem('token')).not.toBeNull()
    expect(setAuthToken).toHaveBeenCalled()
  })

  it('clears the session on logout', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'login' }))
    await user.click(screen.getByRole('button', { name: 'logout' }))

    expect(screen.getByTestId('status')).toHaveTextContent('anonymous')
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('treats a malformed stored token as no role instead of crashing', () => {
    localStorage.setItem('token', 'not-a-jwt')
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByTestId('status')).toHaveTextContent('connected:')
  })
})
