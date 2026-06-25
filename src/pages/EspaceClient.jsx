import { useEffect, useState } from 'react'
import { api } from '../api'

export default function EspaceClient() {
  const [dossiers, setDossiers] = useState([])
  const [selectedDossier, setSelectedDossier] = useState('')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  function refreshDossiers() {
    api.get('/dossiers/me').then((res) => setDossiers(res.data))
  }

  useEffect(refreshDossiers, [])

  async function handleUpload(e) {
    e.preventDefault()
    setMessage('')
    if (!selectedDossier || !file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/documents/${selectedDossier}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMessage('Document en attente de validation.')
    } catch (err) {
      setMessage(err.response?.data?.detail || "Échec de l'envoi du document.")
    }
  }

  return (
    <div>
      <h2>Mon espace client</h2>

      <section>
        <h3>Suivi de mes dossiers</h3>
        <ul>
          {dossiers.map((dossier) => (
            <li key={dossier.id}>
              Dossier #{dossier.id} — {dossier.type} — statut : <strong>{dossier.status}</strong>
              {dossier.refusal_reason && <span> ({dossier.refusal_reason})</span>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Déposer une pièce justificative</h3>
        <form onSubmit={handleUpload}>
          <label>
            Dossier
            <select value={selectedDossier} onChange={(e) => setSelectedDossier(e.target.value)}>
              <option value="">-- choisir --</option>
              {dossiers.map((dossier) => (
                <option key={dossier.id} value={dossier.id}>
                  Dossier #{dossier.id}
                </option>
              ))}
            </select>
          </label>
          <input
            type="file"
            aria-label="Choisir un fichier à uploader"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button type="submit">Uploader le dossier</button>
        </form>
        {message && <p role="status">{message}</p>}
      </section>
    </div>
  )
}
