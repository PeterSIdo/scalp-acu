import { useMemo } from 'react'
import { allPoints } from '../../data/points'
import { EAR_SEARCH_INDEX } from '../../data/earPoints'
import { TCM_SEARCH, ZSA_SEARCH, searchEntries, phrases } from '../../data/systemSearch'
import { earPointInfo } from '../../data/earPointInfo'

// YNSA: point names, meridians, indications and tags. The detail line shows
// the indication that matched.
function ynsaResults(q) {
  // Y points have four identical records per meridian (yin/yang ×
  // strong/soft) — list only the strong yin one so each appears once.
  // A Yin / A Yang also have two records each (A1 and A8 ends of the A
  // line, same name and indications): keep the first per name.
  const seen = new Set()
  return allPoints
    .filter(p =>
      (!p.id.startsWith('YNSA-Y-') || /-yin$/.test(p.id)) && (
      p.name.toLowerCase().includes(q) ||
      p.meridian?.toLowerCase().includes(q) ||
      p.indications?.some(ind => ind.toLowerCase().includes(q)) ||
      p.tags?.some(tag => tag.toLowerCase().includes(q))
    ))
    .filter(p => !seen.has(p.name) && seen.add(p.name))
    .map(p => ({ key: p.id, name: p.name, detail: p.indications?.find(i => i.toLowerCase().includes(q)), item: p, enabled: true }))
}

// Each ear point's Indications phrases (from its description card), built once.
let earIndications = null
function earIndicationsOf(e) {
  earIndications ??= new Map(EAR_SEARCH_INDEX.map(x => {
    const info = earPointInfo(x.tile, x.name)
    // Items are split into phrases like paragraphs, so a hit shows just the
    // matching phrase (labels such as "Sleep:" are dropped).
    const sections = (info?.sections ?? []).map(s => ({ ...s, paragraphs: [...(s.paragraphs ?? []), ...(s.items ?? []).map(it => it.text)], items: [] }))
    return [x.key, phrases({ sections }, ['Indications'])]
  }))
  return earIndications.get(e.key)
}

// Ear: point names, their categories / groups, then their indications. Name
// matches come first, those starting with the query ahead of the rest. The
// detail line names the tile and categories (a point can be on more than one
// tile), or for an indication match, the indication that matched.
function earResults(q) {
  return EAR_SEARCH_INDEX
    .map(e => {
      const name = e.name.toLowerCase()
      const rank = name.startsWith(q) ? 0 : name.includes(q) ? 1 : e.groups.some(g => g.toLowerCase().includes(q)) ? 2 : 3
      const hit = rank === 3 ? earIndicationsOf(e).find(t => t.toLowerCase().includes(q)) : null
      return rank < 3 || hit ? { e, rank, detail: hit ?? [e.tileTitle, ...e.groups].join(' · ') } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank)
    .map(({ e, detail }) => ({ key: e.key, name: e.name, detail, item: e, enabled: e.drawn }))
}

// `system` picks what's searched: the active tab ('ynsa', 'tcm', 'zsa',
// 'ear'). TCM and ZSA results carry a search entry ({ item, pick }) as `item`.
export default function SearchPanel({ query, onSelect, system = 'ynsa' }) {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    if (system === 'ear') return earResults(q)
    if (system === 'tcm') return searchEntries(TCM_SEARCH, q)
    if (system === 'zsa') return searchEntries(ZSA_SEARCH, q)
    return ynsaResults(q)
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
