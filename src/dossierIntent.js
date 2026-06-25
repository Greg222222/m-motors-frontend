const KEY = 'pendingDossierIntent'

export function setPendingIntent(vehicleId, type) {
  sessionStorage.setItem(KEY, JSON.stringify({ vehicleId, type }))
}

export function getPendingIntent() {
  const raw = sessionStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearPendingIntent() {
  sessionStorage.removeItem(KEY)
}
