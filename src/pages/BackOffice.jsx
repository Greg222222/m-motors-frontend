import { useEffect, useState } from 'react'
import { api } from '../api'

export default function BackOffice() {
  const [vehicles, setVehicles] = useState([])
  const [dossiers, setDossiers] = useState([])
  const [form, setForm] = useState({
    brand: '',
    model: '',
    mileage: '',
    price_sale: '',
    price_rent_monthly: '',
    mode: 'sale',
  })
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
        mileage: Number(form.mileage),
        price_sale: form.price_sale ? Number(form.price_sale) : null,
        price_rent_monthly: form.price_rent_monthly ? Number(form.price_rent_monthly) : null,
        mode: form.mode,
      })
      setMessage('Véhicule ajouté au catalogue.')
      setForm({ brand: '', model: '', mileage: '', price_sale: '', price_rent_monthly: '', mode: 'sale' })
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

  async function decide(dossierId, approve) {
    const refusal_reason = approve ? undefined : window.prompt('Motif du refus :') || ''
    if (!approve && !refusal_reason) return
    try {
      await api.post(`/dossiers/${dossierId}/decision`, { approve, refusal_reason })
      refresh()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Décision impossible.')
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
            placeholder="Kilométrage"
            required
            value={form.mileage}
            onChange={(e) => setForm({ ...form, mileage: e.target.value })}
          />
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
          <button type="submit">Ajouter</button>
        </form>
        {message && <p role="status">{message}</p>}
      </section>

      <section>
        <h3>Parc automobile</h3>
        <ul>
          {vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              {vehicle.brand} {vehicle.model} — mode : {vehicle.mode}
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
        <ul>
          {dossiers.map((dossier) => (
            <li key={dossier.id}>
              Dossier #{dossier.id} — {dossier.type} — statut : {dossier.status}
              {dossier.status === 'en_attente' && (
                <>
                  <button onClick={() => decide(dossier.id, true)}>Valider</button>
                  <button onClick={() => decide(dossier.id, false)}>Refuser</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
