import { useEffect, useState } from 'react'
import { api } from '../api'
import VehicleImage from '../components/VehicleImage'

const STATUS_LABELS = {
  en_attente: 'En attente',
  valide: 'Validé',
  refuse: 'Refusé',
}

function DossierCard({ dossier, onUploaded }) {
  const [documents, setDocuments] = useState([])
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  function refreshDocuments() {
    api.get(`/documents/${dossier.id}`).then((res) => setDocuments(res.data))
  }

  useEffect(refreshDocuments, [dossier.id])

  async function handleUpload(e) {
    e.preventDefault()
    setMessage('')
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/documents/${dossier.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage('Document en attente de validation.')
      setFile(null)
      refreshDocuments()
      onUploaded?.()
    } catch (err) {
      setMessage(err.response?.data?.detail || "Échec de l'envoi du document.")
    }
  }

  async function viewDocument(doc) {
    const response = await api.get(`/documents/${dossier.id}/${doc.id}/file`, { responseType: 'blob' })
    const url = URL.createObjectURL(response.data)
    window.open(url, '_blank')
  }

  return (
    <li className="dossier-card">
      <VehicleImage vehicle={dossier.vehicle} height={100} />
      <div>
        <h3>
          {dossier.vehicle.brand} {dossier.vehicle.model} ({dossier.vehicle.year})
        </h3>
        <p>
          Dossier #{dossier.id} — {dossier.type} — statut :{' '}
          <strong>{STATUS_LABELS[dossier.status] || dossier.status}</strong>
        </p>
        {dossier.refusal_reason && <p role="alert">Motif du refus : {dossier.refusal_reason}</p>}

        <p>Pièces déposées :</p>
        <ul>
          {documents.map((doc) => (
            <li key={doc.id}>
              <button type="button" onClick={() => viewDocument(doc)}>
                {doc.filename}
              </button>
            </li>
          ))}
          {documents.length === 0 && <li>Aucune pièce déposée pour le moment.</li>}
        </ul>

        {dossier.status === 'en_attente' && (
          <form onSubmit={handleUpload}>
            <input
              type="file"
              aria-label="Choisir un fichier à uploader"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button type="submit">Uploader le dossier</button>
          </form>
        )}
        {message && <p role="status">{message}</p>}
      </div>
    </li>
  )
}

export default function EspaceClient() {
  const [dossiers, setDossiers] = useState([])

  function refreshDossiers() {
    api.get('/dossiers/me').then((res) => setDossiers(res.data))
  }

  useEffect(refreshDossiers, [])

  return (
    <div>
      <h2>Mon espace client</h2>
      <section>
        <h3>Mes dossiers</h3>
        {dossiers.length === 0 && <p>Vous n'avez pas encore de dossier en cours. Parcourez le catalogue pour démarrer une demande.</p>}
        <ul className="dossier-list">
          {dossiers.map((dossier) => (
            <DossierCard key={dossier.id} dossier={dossier} onUploaded={refreshDossiers} />
          ))}
        </ul>
      </section>
    </div>
  )
}
