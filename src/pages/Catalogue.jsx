import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Catalogue() {
  const [mode, setMode] = useState('')
  const [vehicles, setVehicles] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/vehicles', { params: mode ? { mode } : {} })
      .then((res) => setVehicles(res.data))
      .catch(() => setError('Impossible de charger le catalogue.'))
  }, [mode])

  return (
    <div>
      <h2>Catalogue véhicules</h2>
      <div role="group" aria-label="Filtre Achat / Location">
        <button onClick={() => setMode('')} aria-pressed={mode === ''}>
          Tous
        </button>
        <button onClick={() => setMode('sale')} aria-pressed={mode === 'sale'}>
          Achat
        </button>
        <button onClick={() => setMode('rent')} aria-pressed={mode === 'rent'}>
          Location
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      <ul>
        {vehicles.map((vehicle) => (
          <li key={vehicle.id}>
            {vehicle.brand} {vehicle.model} — {vehicle.mileage} km —{' '}
            {mode === 'rent' && vehicle.price_rent_monthly
              ? `${vehicle.price_rent_monthly} €/mois`
              : vehicle.price_sale
                ? `${vehicle.price_sale} €`
                : `${vehicle.price_rent_monthly} €/mois`}
          </li>
        ))}
      </ul>
    </div>
  )
}
