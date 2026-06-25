import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import VehicleImage from '../components/VehicleImage'
import { setPendingIntent } from '../dossierIntent'

const FUEL_LABELS = {
  essence: 'Essence',
  diesel: 'Diesel',
  hybride: 'Hybride',
  electrique: 'Électrique',
}

export default function VehicleDetail() {
  const { id } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api
      .get(`/vehicles/${id}`)
      .then((res) => setVehicle(res.data))
      .catch(() => setError("Ce véhicule n'existe pas ou n'est plus disponible."))
  }, [id])

  async function requestVehicle(type) {
    setMessage('')
    setError('')
    if (!isAuthenticated) {
      setPendingIntent(vehicle.id, type)
      navigate('/auth')
      return
    }
    try {
      await api.post('/dossiers', { vehicle_id: vehicle.id, type })
      navigate('/espace-client')
    } catch (err) {
      setError(err.response?.data?.detail || 'Impossible de créer le dossier pour ce véhicule.')
    }
  }

  if (error && !vehicle) return <p role="alert">{error}</p>
  if (!vehicle) return <p>Chargement…</p>

  return (
    <article>
      <VehicleImage vehicle={vehicle} height={280} />
      <h2>
        {vehicle.brand} {vehicle.model} ({vehicle.year})
      </h2>
      <p>{vehicle.description || 'Aucune description fournie pour ce véhicule.'}</p>
      <dl>
        <dt>Kilométrage</dt>
        <dd>{vehicle.mileage.toLocaleString('fr-FR')} km</dd>
        <dt>Couleur</dt>
        <dd>{vehicle.color}</dd>
        <dt>Carburant</dt>
        <dd>{FUEL_LABELS[vehicle.fuel_type] || vehicle.fuel_type}</dd>
        {vehicle.price_sale != null && (
          <>
            <dt>Prix achat</dt>
            <dd>{vehicle.price_sale.toLocaleString('fr-FR')} €</dd>
          </>
        )}
        {vehicle.price_rent_monthly != null && (
          <>
            <dt>Location longue durée</dt>
            <dd>{vehicle.price_rent_monthly.toLocaleString('fr-FR')} €/mois</dd>
          </>
        )}
      </dl>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      {vehicle.is_engaged ? (
        <p role="status">Ce véhicule fait déjà l'objet d'un dossier en cours.</p>
      ) : (
        <div role="group" aria-label="Demander ce véhicule">
          {(vehicle.mode === 'sale' || vehicle.mode === 'both') && (
            <button onClick={() => requestVehicle('achat')}>Demander à l'achat</button>
          )}
          {(vehicle.mode === 'rent' || vehicle.mode === 'both') && (
            <button onClick={() => requestVehicle('location')}>Demander en location</button>
          )}
        </div>
      )}
    </article>
  )
}
