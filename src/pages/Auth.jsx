import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api'
import { useAuth } from '../AuthContext'
import { clearPendingIntent, getPendingIntent } from '../dossierIntent'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'register') {
        await api.post('/auth/register', { email, password })
      }
      const form = new URLSearchParams({ username: email, password })
      const response = await api.post('/auth/login', form)
      const token = response.data.access_token
      // Set the header synchronously: login() updates React state, but the
      // AuthProvider effect that wires axios only runs on the next render —
      // too late for the dossier creation call right below.
      setAuthToken(token)
      login(token)

      const pending = getPendingIntent()
      if (pending) {
        clearPendingIntent()
        try {
          await api.post('/dossiers', { vehicle_id: pending.vehicleId, type: pending.type })
        } catch {
          // The vehicle may have become unavailable between the catalogue view and
          // login; the client still lands in their space and can browse again.
        }
      }
      navigate('/espace-client')
    } catch (err) {
      setError(err.response?.data?.detail || "Une erreur est survenue.")
    }
  }

  return (
    <div>
      <h2>{mode === 'login' ? 'Connexion' : 'Inscription'}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">{mode === 'login' ? 'Se connecter' : "S'inscrire"}</button>
      </form>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà inscrit ? Se connecter'}
      </button>
    </div>
  )
}
