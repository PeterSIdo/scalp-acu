import { useMemo } from 'react'
import { allPoints } from '../../data/points'

export default function SearchPanel({ query, onSelect }) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allPoints.filter(p =>
      p.indications?.some(ind => ind.toLowerCase().includes(q))
    )
  }, [query])

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
          {results.map(p => {
            const match = p.indications?.find(i =>
              i.toLowerCase().includes(query.trim().toLowerCase())
            )
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-amber-600 dark:text-amber-400 text-sm font-semibold">{p.name}</div>
                {match && (
                  <div className="text-black dark:text-gray-400 text-xs mt-0.5 truncate">{match}</div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
