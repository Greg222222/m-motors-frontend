function hashHue(text) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 360
  }
  return hash
}

export default function VehicleImage({ vehicle, height = 160 }) {
  if (vehicle.image_url) {
    return (
      <img
        src={vehicle.image_url}
        alt={`${vehicle.brand} ${vehicle.model}`}
        style={{ width: '100%', height, objectFit: 'cover', borderRadius: 6 }}
      />
    )
  }

  const hue = hashHue(`${vehicle.brand}${vehicle.model}`)
  const gradient = `linear-gradient(135deg, hsl(${hue}, 65%, 45%), hsl(${(hue + 40) % 360}, 65%, 30%))`

  return (
    <div
      role="img"
      aria-label={`${vehicle.brand} ${vehicle.model}`}
      style={{
        width: '100%',
        height,
        borderRadius: 6,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.1rem',
        textAlign: 'center',
        padding: '0.5rem',
      }}
    >
      {vehicle.brand} {vehicle.model}
    </div>
  )
}
