import { useGLTF } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { Box3, Vector3 } from 'three'

export default function HeadModel({ onSurfaceClick, onLoaded }) {
  const { scene } = useGLTF('/models/head_bust.glb')
  const ref = useRef()

  useEffect(() => {
    if (!scene) return

    // Auto-center and scale the model to fit in a ~2-unit tall space
    const box = new Box3().setFromObject(scene)
    const center = new Vector3()
    const size = new Vector3()
    box.getCenter(center)
    box.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2 / maxDim

    scene.scale.setScalar(scale)
    scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale)

    if (onLoaded) onLoaded()
  }, [scene])

  function handleClick(e) {
    if (onSurfaceClick) {
      const { x, y, z } = e.point
      onSurfaceClick({ x: +x.toFixed(4), y: +y.toFixed(4), z: +z.toFixed(4) })
    }
  }

  return (
    <primitive
      ref={ref}
      object={scene}
      onClick={handleClick}
    />
  )
}

useGLTF.preload('/models/head_bust.glb')
