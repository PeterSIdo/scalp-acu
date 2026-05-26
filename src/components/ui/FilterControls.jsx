import { zones } from '../../data/points'

export default function FilterControls({ activeZone, onZoneChange }) {
  const allZones = ['all', ...zones]

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-gray-800">
      {allZones.map(zone => (
        <button
          key={zone}
          onClick={() => onZoneChange(zone)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${
            activeZone === zone
              ? 'bg-amber-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          {zone === 'all' ? 'All zones' : zone}
        </button>
      ))}
    </div>
  )
}
