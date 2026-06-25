import { createContext, useContext, useState } from 'react'
import { setAuthToken } from './api'

const AuthContext = createContext(null)

function decodeRole(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [role, setRole] = useState(() => (token ? decodeRole(token) : null))

  // Set synchronously during render, not in an effect: child pages call the
  // API from their own effects, and effects run child-first, so a parent
  // effect here would attach the auth header *after* those requests already
  // went out unauthenticated on every fresh page load.
  setAuthToken(token)

  function login(newToken) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setRole(decodeRole(newToken))
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
