import { useRef, useState } from 'react'

export default function PointMarker({ point, isLocked, onSelect }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  function handleClick(e) {
    e.stopPropagation()
    if (isLocked) return
    onSelect(point)
  }

  const scale = hovered ? 1.4 : 1
  const color = isLocked ? '#6b7280' : hovered ? '#fbbf24' : '#f59e0b'

  return (
    <mesh
      ref={ref}
      position={[point.coordinates.x, point.coordinates.y, point.coordinates.z]}
      scale={scale}
      onClick={handleClick}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); document.body.style.cursor = isLocked ? 'not-allowed' : 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      <sphereGeometry args={[0.007, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  )
}
