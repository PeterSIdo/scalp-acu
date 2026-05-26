import { useState } from 'react'
import { Link } from 'react-router-dom'
import { allPoints } from '../data/points'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import SceneCanvas from '../components/viewer/SceneCanvas'
import InfoPanel from '../components/ui/InfoPanel'
import FilterControls from '../components/ui/FilterControls'
import SubscriptionBanner from '../components/ui/SubscriptionGate'

export default function ViewerPage() {
  const { user, logout } = useAuth()
  const { isActive, status } = useSubscription()
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [activeZone, setActiveZone] = useState('all')

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 flex-shrink-0">
        <Link to="/" className="text-amber-400 font-bold text-lg">ScalpAcu</Link>
        <span className="text-gray-400 text-sm hidden sm:block">
          Yamamoto New Scalp Acupuncture (YNSA)
        </span>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/account" className="text-gray-400 hover:text-white transition-colors">Account</Link>
          <button onClick={logout} className="text-gray-500 hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      {/* Subscription banner */}
      <SubscriptionBanner status={status} />

      {/* Main content: canvas + panel */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* 3D canvas */}
        <div className="flex-1 min-h-[300px] md:min-h-0">
          <SceneCanvas
            points={allPoints}
            isSubscribed={isActive}
            activeZone={activeZone}
            onSelectPoint={setSelectedPoint}
          />
        </div>

        {/* Side panel */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-t md:border-t-0 md:border-l border-gray-800 bg-gray-950">
          <FilterControls activeZone={activeZone} onZoneChange={setActiveZone} />
          <div className="flex-1 overflow-y-auto">
            <InfoPanel point={selectedPoint} isSubscribed={isActive} />
          </div>
          <div className="px-4 py-2 border-t border-gray-800 text-gray-600 text-xs">
            <a href="https://poly.pizza/m/eqJEiOX0Fhl" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400">
              male_base by hedy magroun · CC-BY 3.0 · Poly Pizza
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
