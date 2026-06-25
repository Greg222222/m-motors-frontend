import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import VehicleImage from '../components/VehicleImage'

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

      <ul className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <li key={vehicle.id} className="vehicle-card">
            <Link to={`/vehicules/${vehicle.id}`}>
              <VehicleImage vehicle={vehicle} />
              <h3>
                {vehicle.brand} {vehicle.model}
              </h3>
              <p className="vehicle-card-meta">
                {vehicle.year} · {vehicle.mileage.toLocaleString('fr-FR')} km
              </p>
              <p className="vehicle-card-description">{vehicle.description}</p>
              <p className="vehicle-card-price">
                {mode === 'rent' && vehicle.price_rent_monthly
                  ? `${vehicle.price_rent_monthly.toLocaleString('fr-FR')} €/mois`
                  : vehicle.price_sale
                    ? `${vehicle.price_sale.toLocaleString('fr-FR')} €`
                    : `${vehicle.price_rent_monthly.toLocaleString('fr-FR')} €/mois`}
              </p>
              {vehicle.is_engaged && <span className="badge">Réservé</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
