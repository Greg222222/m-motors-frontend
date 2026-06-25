import { createContext, useContext, useEffect, useState } from 'react'
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

  useEffect(() => {
    setAuthToken(token)
  }, [token])

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
