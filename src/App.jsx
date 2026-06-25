import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Auth from './pages/Auth'
import BackOffice from './pages/BackOffice'
import Catalogue from './pages/Catalogue'
import EspaceClient from './pages/EspaceClient'

function PrivateRoute({ children, adminOnly = false }) {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (adminOnly && role !== 'admin') return <Navigate to="/" replace />
  return children
}

function Nav() {
  const { isAuthenticated, role, logout } = useAuth()
  return (
    <nav>
      <Link to="/">Catalogue</Link>
      {isAuthenticated ? (
        <>
          <Link to="/espace-client">Mon espace</Link>
          {role === 'admin' && <Link to="/back-office">Back-office</Link>}
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
          <Route
            path="/back-office"
            element={
              <PrivateRoute adminOnly>
                <BackOffice />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </AuthProvider>
  )
}

export default App
