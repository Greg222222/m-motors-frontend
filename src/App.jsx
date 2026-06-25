import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Auth from './pages/Auth'
import Catalogue from './pages/Catalogue'
import EspaceClient from './pages/EspaceClient'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return children
}

function Nav() {
  const { isAuthenticated, logout } = useAuth()
  return (
    <nav>
      <Link to="/">Catalogue</Link>
      {isAuthenticated ? (
        <>
          <Link to="/espace-client">Mon espace</Link>
          <button onClick={logout}>Se déconnecter</button>
        </>
      ) : (
        <Link to="/auth">Connexion</Link>
      )}
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Catalogue />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/espace-client"
            element={
              <PrivateRoute>
                <EspaceClient />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </AuthProvider>
  )
}

export default App
