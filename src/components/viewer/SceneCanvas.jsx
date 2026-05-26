import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import HeadModel from './HeadModel'
import PointMarkers from './PointMarkers'

export default function SceneCanvas({ points, isSubscribed, activeZone, onSelectPoint, coordinatePickerMode }) {
  const [loaded, setLoaded] = useState(false)

  function handleSurfaceClick(coords) {
    if (coordinatePickerMode) {
      console.log('Point coordinates:', JSON.stringify(coords))
    }
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-gray-500 text-sm">Loading model…</div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: '#111827' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={1.2} />
        <directionalLight position={[-3, 2, -3]} intensity={0.4} />

        <OrbitControls
          enablePan={false}
          minDistance={0.8}
          maxDistance={4}
          target={[0, 0, 0]}
        />

        <Suspense fallback={null}>
          <HeadModel onSurfaceClick={handleSurfaceClick} onLoaded={() => setLoaded(true)} />
          <PointMarkers
            points={points}
            isSubscribed={isSubscribed}
            activeZone={activeZone}
            onSelect={onSelectPoint}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
