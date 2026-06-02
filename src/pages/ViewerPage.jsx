import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import HeadLateral from '../components/viewer/HeadLateral'
import HeadFrontalSvg   from '../assets/diagrams/head_front.svg?react'
import HeadPosteriorSvg from '../assets/diagrams/head_back.svg?react'
import HeadSuperiorSvg  from '../assets/diagrams/head_top.svg?react'
import InfoPanel from '../components/ui/InfoPanel'
import SubscriptionBanner from '../components/ui/SubscriptionGate'

const VIEWS = ['Lateral', 'Frontal', 'Posterior', 'Superior']

export default function ViewerPage() {
  const { logout } = useAuth()
  const { isActive, status } = useSubscription()
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [activeView, setActiveView] = useState('Lateral')

  const ViewTabs = ({ className = '' }) => (
    <div className={`flex border-b border-gray-800 ${className}`}>
      {VIEWS.map(view => (
        <button
          key={view}
          onClick={() => setActiveView(view)}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeView === view
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-gray-500 hover:text-gray-200'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  )

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

      <SubscriptionBanner status={status} />

      {/* ── Mobile view tabs (above diagram) ── */}
      <ViewTabs className="md:hidden flex-shrink-0" />

      {/* Main content */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">

        {/* Diagram — fills available space on both mobile and desktop */}
        <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-900 overflow-hidden p-4">
          {activeView === 'Lateral'   && <HeadLateral onPointSelect={setSelectedPoint} />}
          {activeView === 'Frontal'   && <HeadFrontalSvg   style={{ width: '100%', height: '100%', maxHeight: '100%' }} />}
          {activeView === 'Posterior' && <HeadPosteriorSvg style={{ width: '100%', height: '100%', maxHeight: '100%' }} />}
          {activeView === 'Superior'  && <HeadSuperiorSvg  style={{ width: '100%', height: '100%', maxHeight: '100%' }} />}
        </div>

        {/* ── Desktop side panel ── */}
        <div className="hidden md:flex w-80 lg:w-96 flex-col border-l border-gray-800 bg-gray-950">
          <ViewTabs />
          <div className="flex-1 overflow-y-auto">
            <InfoPanel point={selectedPoint} isSubscribed={isActive} />
          </div>
          <div className="px-4 py-2 border-t border-gray-800 text-gray-600 text-xs">
            © CareTrace 2026
          </div>
        </div>
      </div>

      {/* ── Mobile bottom sheet ── */}
      {selectedPoint && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-gray-950 rounded-t-2xl shadow-2xl max-h-[65vh]">
          {/* Handle + close */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <span className="text-sm font-semibold text-gray-200">{selectedPoint.name}</span>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-gray-400 hover:text-white text-2xl leading-none ml-3"
              aria-label="Close"
            >×</button>
          </div>
          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            <InfoPanel point={selectedPoint} isSubscribed={isActive} />
          </div>
        </div>
      )}
    </div>
  )
}
