import { useMemo } from 'react'
import { allPoints } from '../../data/points'
import { EAR_SEARCH_INDEX } from '../../data/earPoints'

// YNSA: point names, meridians, indications and tags. The detail line shows
// the indication that matched.
function ynsaResults(q) {
  // Y points have four identical records per meridian (yin/yang ×
  // strong/soft) — list only the strong yin one so each appears once.
  return allPoints
    .filter(p =>
      (!p.id.startsWith('YNSA-Y-') || /-yin$/.test(p.id)) && (
      p.name.toLowerCase().includes(q) ||
      p.meridian?.toLowerCase().includes(q) ||
      p.indications?.some(ind => ind.toLowerCase().includes(q)) ||
      p.tags?.some(tag => tag.toLowerCase().includes(q))
    ))
    .map(p => ({ key: p.id, name: p.name, detail: p.indications?.find(i => i.toLowerCase().includes(q)), item: p, enabled: true }))
}

// Ear: point names and their categories / groups. Name matches come first,
// those starting with the query ahead of the rest. The detail line names the
// tile and the point's categories, since a point can be on more than one tile.
function earResults(q) {
  const rank = e => {
    const name = e.name.toLowerCase()
    return name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2
  }
  return EAR_SEARCH_INDEX
    .filter(e => rank(e) < 2 || e.groups.some(g => g.toLowerCase().includes(q)))
    .sort((a, b) => rank(a) - rank(b))
    .map(e => ({ key: e.key, name: e.name, detail: [e.tileTitle, ...e.groups].join(' · '), item: e, enabled: e.drawn }))
}

// `system` picks what's searched: 'ear' for the Ear tab, YNSA otherwise.
export default function SearchPanel({ query, onSelect, system = 'ynsa' }) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return system === 'ear' ? earResults(q) : ynsaResults(q)
  }, [query, system])

  if (!query.trim()) return null

  return (
    <div className="flex-1 overflow-y-auto">
      {results.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm p-4">No points found for &ldquo;{query}&rdquo;</p>
      ) : (
        <div className="p-2 space-y-1">
          <p className="text-gray-400 dark:text-gray-500 text-xs px-2 pb-1">
            {results.length} point{results.length !== 1 ? 's' : ''} found
          </p>
          {results.map(({ key, name, detail, item, enabled }) => (
            // Points listed but not drawn yet are shown greyed, like the ear dropdowns.
            <button
              key={key}
              disabled={!enabled}
              onClick={() => onSelect(item)}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/60 enabled:hover:bg-gray-200 dark:enabled:hover:bg-gray-700 disabled:cursor-default transition-colors"
            >
              <div className={`text-sm font-semibold ${enabled ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-600'}`}>{name}</div>
              {detail && (
                <div className={`text-xs mt-0.5 truncate ${enabled ? 'text-black dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>{detail}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
