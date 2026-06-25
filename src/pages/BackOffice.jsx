import { useEffect, useState } from 'react'
import { api } from '../api'
import VehicleImage from '../components/VehicleImage'

const EMPTY_FORM = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: '',
  color: '',
  fuel_type: 'essence',
  description: '',
  image_url: '',
  price_sale: '',
  price_rent_monthly: '',
  mode: 'sale',
}

function DossierReview({ dossier, onDecided }) {
  const [documents, setDocuments] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/documents/${dossier.id}`).then((res) => setDocuments(res.data))
  }, [dossier.id])

  async function viewDocument(doc) {
    const response = await api.get(`/documents/${dossier.id}/${doc.id}/file`, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data)
    window.open(url, '_blank')
  }

  async function decide(approve) {
    const refusal_reason = approve ? undefined : window.prompt('Motif du refus :') || ''
    if (!approve && !refusal_reason) return
    try {
      await api.post(`/dossiers/${dossier.id}/decision`, { approve, refusal_reason })
      onDecided()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Décision impossible.')
    }
  }

  return (
    <li className="dossier-card">
      <VehicleImage vehicle={dossier.vehicle} height={100} />
      <div>
        <h3>
          {dossier.vehicle.brand} {dossier.vehicle.model} — {dossier.type}
        </h3>
        <p>
          Client : {dossier.user.email} — statut : <strong>{dossier.status}</strong>
        </p>
        <p>Pièces jointes :</p>
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>
              <button type="button" onClick={() => viewDocument(doc)}>
                {doc.filename}
              </button>
            </li>
          ))}
          {documents.length === 0 && <li>Aucune pièce déposée.</li>}
        </ul>
        {message && <p role="alert">{message}</p>}
        {dossier.status === 'en_attente' && (
          <div>
            <button onClick={() => decide(true)}>Valider</button>
            <button onClick={() => decide(false)}>Refuser</button>
          </div>
        )}
      </div>
    </li>
  )
}

export default function BackOffice() {
  const [vehicles, setVehicles] = useState([])
  const [dossiers, setDossiers] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [message, setMessage] = useState('')

  function refresh() {
    api.get('/vehicles').then((res) => setVehicles(res.data))
    api.get('/dossiers').then((res) => setDossiers(res.data))
  }

  useEffect(refresh, [])

  async function handleAddVehicle(e) {
    e.preventDefault()
    setMessage('')
    try {
      await api.post('/vehicles', {
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        mileage: Number(form.mileage),
        color: form.color,
        fuel_type: form.fuel_type,
        description: form.description,
        image_url: form.image_url || null,
        price_sale: form.price_sale ? Number(form.price_sale) : null,
        price_rent_monthly: form.price_rent_monthly ? Number(form.price_rent_monthly) : null,
        mode: form.mode,
      })
      setMessage('Véhicule ajouté au catalogue.')
      setForm(EMPTY_FORM)
      refresh()
    } catch (err) {
      setMessage(err.response?.data?.detail || "Échec de l'ajout du véhicule.")
    }
  }

  async function toggleMode(vehicle) {
    const newMode = vehicle.mode === 'sale' ? 'rent' : 'sale'
    try {
      await api.patch(`/vehicles/${vehicle.id}/mode`, { mode: newMode })
      refresh()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Bascule impossible.')
    }
  }

  return (
    <div>
      <h2>Back-office M-Motors</h2>

      <section>
        <h3>Ajouter un véhicule</h3>
        <form onSubmit={handleAddVehicle}>
          <input
            placeholder="Marque"
            required
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
          <input
            placeholder="Modèle"
            required
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
          <input
            type="number"
            placeholder="Année"
            required
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
          <input
            type="number"
            placeholder="Kilométrage"
            required
            value={form.mileage}
            onChange={(e) => setForm({ ...form, mileage: e.target.value })}
          />
          <input
            placeholder="Couleur"
            required
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
          <select value={form.fuel_type} onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
          </select>
          <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            <option value="sale">Achat</option>
            <option value="rent">Location</option>
            <option value="both">Achat + Location</option>
          </select>
          <input
            type="number"
            placeholder="Prix vente (€)"
            value={form.price_sale}
            onChange={(e) => setForm({ ...form, price_sale: e.target.value })}
          />
          <input
            type="number"
            placeholder="Mensualité location (€)"
            value={form.price_rent_monthly}
            onChange={(e) => setForm({ ...form, price_rent_monthly: e.target.value })}
          />
          <input
            placeholder="URL photo (optionnel)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button type="submit">Ajouter</button>
        </form>
        {message && <p role="status">{message}</p>}
      </section>

      <section>
        <h3>Parc automobile</h3>
        <ul className="vehicle-grid">
          {vehicles.map((vehicle) => (
            <li key={vehicle.id} className="vehicle-card">
              <VehicleImage vehicle={vehicle} />
              <h4>
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h4>
              <p>
                {vehicle.color} · {vehicle.fuel_type} · mode : {vehicle.mode}
              </p>
              {vehicle.mode !== 'both' && (
                <button onClick={() => toggleMode(vehicle)} disabled={vehicle.is_engaged}>
                  Basculer en {vehicle.mode === 'sale' ? 'Location' : 'Vente'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Dossiers clients</h3>
        <ul className="dossier-list">
          {dossiers.map((dossier) => (
            <DossierReview key={dossier.id} dossier={dossier} onDecided={refresh} />
          ))}
        </ul>
      </section>
    </div>
  )
}
