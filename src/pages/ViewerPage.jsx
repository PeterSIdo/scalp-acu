import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../providers/ThemeProvider'
import HeadLateral   from '../components/viewer/HeadLateral'
import HeadFrontal   from '../components/viewer/HeadFrontal'
import HeadPosterior from '../components/viewer/HeadPosterior'
import ZoomableView from '../components/viewer/ZoomableView'
import InfoPanel from '../components/ui/InfoPanel'
import SearchPanel from '../components/ui/SearchPanel'
import SubscriptionBanner from '../components/ui/SubscriptionGate'

const VIEWS = ['Lateral', 'Frontal', 'Posterior']

const PREFERRED_VIEW = {
  'YNSA-Eye':                      'Frontal',
  'YNSA-Nose':                     'Frontal',
  'YNSA-Mouth':                    'Frontal',
  'YNSA-Brain-Cerebrum-yin':       'Frontal',
  'YNSA-Brain-Cerebellum-yin':     'Frontal',
  'YNSA-Brain-BasalGanglia-yin':   'Frontal',
  'YNSA-Brain-Cerebrum-yang':      'Posterior',
  'YNSA-Brain-Cerebellum-yang':    'Posterior',
  'YNSA-Brain-BasalGanglia-yang':  'Posterior',
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

export default function ViewerPage() {
  const { logout } = useAuth()
  const { isActive, status } = useSubscription()
  const { dark, toggle: toggleTheme } = useTheme()
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [highlightJsonId, setHighlightJsonId] = useState(null)
  const [activeView, setActiveView] = useState('Lateral')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  function handleSearchSelect(point) {
    setSelectedPoint(point)
    setHighlightJsonId(point.id)
    setActiveView(PREFERRED_VIEW[point.id] ?? 'Lateral')
    setSearchQuery('')
    setMobileSearchOpen(false)
  }

  function handlePointSelect(point) {
    setSelectedPoint(point)
    setHighlightJsonId(null)
  }

  const ViewTabs = ({ className = '' }) => (
    <div className={`flex border-b border-gray-200 dark:border-gray-800 ${className}`}>
      {VIEWS.map(view => (
        <button
          key={view}
          onClick={() => setActiveView(view)}
          className={`flex-1 py-2 text-xs font-semibold transition-colors ${
            activeView === view
              ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500 dark:border-amber-400'
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-800 bg-gray-400 dark:bg-gray-950 flex-shrink-0">
        <Link to="/" className="text-black dark:text-amber-400 font-bold text-lg">ScalpAcu</Link>
        <span className="text-gray-600 dark:text-gray-400 text-sm hidden sm:block">
          Yamamoto New Scalp Acupuncture (YNSA)
        </span>
        <div className="flex items-center gap-3 text-sm">
          {/* Mobile search icon */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden text-gray-600 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          <Link to="/account" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Account</Link>
          <button onClick={logout} className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      <SubscriptionBanner status={status} />

      {/* Mobile view tabs */}
      <ViewTabs className="md:hidden flex-shrink-0 bg-white dark:bg-gray-950" />

      {/* Main content */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">

        {/* Diagram */}
        <div className="flex-1 min-h-0 bg-gray-300 dark:bg-gray-900 overflow-hidden p-4">
          <ZoomableView>
            {activeView === 'Lateral'   && <HeadLateral   onPointSelect={handlePointSelect} highlightJsonId={highlightJsonId} />}
            {activeView === 'Frontal'   && <HeadFrontal   onPointSelect={handlePointSelect} highlightJsonId={highlightJsonId} />}
            {activeView === 'Posterior' && <HeadPosterior onPointSelect={handlePointSelect} highlightJsonId={highlightJsonId} />}
          </ZoomableView>
        </div>

        {/* Desktop side panel */}
        <div className="hidden md:flex w-80 lg:w-96 flex-col border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <ViewTabs />

          {/* Search bar */}
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by indication…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm pl-8 pr-8 py-1.5 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Clear"
                >×</button>
              )}
            </div>
          </div>

          {/* Results or info panel */}
          {searchQuery.trim() ? (
            <SearchPanel query={searchQuery} onSelect={handleSearchSelect} />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <InfoPanel point={selectedPoint} isSubscribed={isActive} />
            </div>
          )}

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 text-xs flex-shrink-0">
            © CareTrace 2026
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {selectedPoint && !mobileSearchOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white dark:bg-gray-950 rounded-t-2xl shadow-2xl max-h-[65vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">{selectedPoint.name}</span>
            <button
              onClick={() => setSelectedPoint(null)}
              className="text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl leading-none ml-3"
              aria-label="Close"
            >×</button>
          </div>
          <div className="overflow-y-auto flex-1">
            <InfoPanel point={selectedPoint} isSubscribed={isActive} />
          </div>
        </div>
      )}

      {/* Mobile search overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-950 flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by indication…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm pl-9 pr-8 py-2 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg leading-none"
                >×</button>
              )}
            </div>
            <button
              onClick={() => { setMobileSearchOpen(false); setSearchQuery('') }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex-shrink-0"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!searchQuery.trim() ? (
              <p className="text-gray-400 dark:text-gray-600 text-sm p-4 text-center">Type an indication to find matching points</p>
            ) : (
              <SearchPanel query={searchQuery} onSelect={handleSearchSelect} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
