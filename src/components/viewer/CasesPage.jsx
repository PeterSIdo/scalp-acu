import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CASES, POINT_WARNINGS, caseText } from '../../data/cases'
import { SOURCES } from '../../data/sources'

// The "Cases" tab: a searchable list of articles beside the open article.
// On phones the list folds into a toggle above the article. Scrolls on its
// own, outside ZoomableView, like the Ear Description page.

const H2 = 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-5'
const BODY = 'text-black dark:text-gray-300 text-sm leading-relaxed'

// Small yellow warning triangle with an "!".
function WarningIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={`inline-block flex-shrink-0 ${className}`} aria-hidden="true">
      <path d="M12 2.5 L22.5 21 H1.5 Z" fill="#facc15" stroke="#a16207" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9v5.5" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.3" fill="#000" />
    </svg>
  )
}

// Cases open to visitors without an account; the rest need a (free) account.
const FREE_CASES = 3

// Below the visitor's cases: how many more there are and how to get them.
function MoreCasesNote({ count }) {
  if (count <= 0) return null
  return (
    <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
      {count} more {count === 1 ? 'case is' : 'cases are'} available with a free account.{' '}
      <Link to="/register" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">Create an account</Link>
      {' '}— no card needed.
    </div>
  )
}

const hasWarnings = c => c.points?.some(p => p.warnings?.length)

// Every tag used by the given cases, alphabetical.
const allTags = cases => [...new Set(cases.flatMap(c => c.tags ?? []))].sort((a, b) => a.localeCompare(b))

function CaseList({ cases, lockedCount, selectedId, onSelect, activeTags, onToggleTag }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const list = cases.filter(c =>
    (!q || caseText(c).includes(q)) &&
    activeTags.every(t => c.tags?.includes(t)))
  const tags = allTags(cases)
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search condition, point, method…"
        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-base md:text-sm px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map(t => {
            const on = activeTags.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => onToggleTag(t)}
                aria-pressed={on}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                  on
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-[#63ECE1]/25 border-transparent text-black dark:text-gray-200 hover:border-amber-500'
                }`}
              >
                {t}
              </button>
            )
          })}
          {activeTags.length > 0 && (
            <button type="button" onClick={() => onToggleTag(null)} className="text-[11px] px-1 text-gray-500 hover:text-amber-500 underline">
              Clear
            </button>
          )}
        </div>
      )}
      <ul className="mt-2">
        {list.map(c => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={`block w-full text-left px-2 py-2 rounded text-sm font-semibold transition-colors ${
                c.id === selectedId
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'text-gray-700 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
              }`}
            >
              {c.title}
              {hasWarnings(c) && (
                <span title="Has a point with a safety warning"><WarningIcon className="w-3.5 h-3.5 ml-1.5 -mt-0.5" /></span>
              )}
              {c.points?.length > 0 && (
                <span className="block text-[11px] font-normal text-gray-500 dark:text-gray-400">
                  {c.points.map(p => (p.code ? `${p.name} (${p.code})` : p.name)).join(', ')}
                </span>
              )}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="px-2 py-2 text-xs text-gray-400">No cases match</li>}
      </ul>
      <MoreCasesNote count={lockedCount} />
    </div>
  )
}

// ISO dates are formatted; anything else (e.g. 'September–October 2026') shows as written.
const formatDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d)
  ? new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : d

// A section list. An item is a string, or { text, items } for a nested
// bullet list under it.
function SectionList({ items, ordered }) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1.5`}>
      {items.map((it, i) => typeof it === 'string'
        ? <li key={i} className={BODY}>{it}</li>
        : (
          <li key={i} className={BODY}>
            {it.text}
            <ul className="list-[circle] pl-5 mt-1 space-y-1">
              {it.items.map((s, j) => <li key={j}>{s}</li>)}
            </ul>
          </li>
        ))}
    </Tag>
  )
}

// A section table: { head: [string], rows: [[string]] }. Scrolls sideways on narrow screens.
function SectionTable({ table }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {table.head.map(h => (
              <th key={h} className="text-left font-semibold text-black dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 px-2 py-1.5">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-200 dark:border-gray-800">
              {r.map((cell, j) => (
                <td key={j} className={`${BODY} align-top px-2 py-1.5 ${j === 0 ? 'font-semibold whitespace-nowrap' : ''}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Article({ c, onTagClick }) {
  const src = c.source && SOURCES[c.source]
  return (
    <article>
      <h1 className="text-xl font-bold text-black dark:text-white">{c.title}</h1>
      {(c.date || src?.kind === 'clinic') && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {c.date && formatDate(c.date)}
          {c.date && src?.kind === 'clinic' && ' · '}
          {src?.kind === 'clinic' && src.title}
        </p>
      )}
      {c.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {c.tags.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onTagClick(t)}
              title={`Show all cases tagged ${t}`}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#63ECE1]/40 text-black dark:text-gray-200 hover:bg-amber-500/30"
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {c.points?.length > 0 && (
        <>
          <h2 className={H2}>{c.points.length > 1 ? 'Points' : 'Point'}</h2>
          {c.points.map(p => (
            <div key={p.name} className="mb-2">
              <p className="text-sm font-bold text-black dark:text-gray-100">{p.name}{p.code && <span className="text-amber-600 dark:text-amber-400"> ({p.code})</span>}</p>
              {p.warnings?.map(w => (
                <p key={w} className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 my-1">
                  <WarningIcon />{POINT_WARNINGS[w]}
                </p>
              ))}
              {p.location && <p className={BODY}><span className="font-semibold">Location: </span>{p.location}</p>}
            </div>
          ))}
        </>
      )}

      {c.methods?.length > 0 && (
        <>
          <h2 className={H2}>Methods</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {c.methods.map(m => (
              <section key={m.name} className="rounded border border-gray-200 dark:border-gray-800 p-3">
                <h3 className="text-sm font-bold text-black dark:text-gray-100">{m.name}</h3>
                {m.indication && <p className="text-xs italic text-gray-500 dark:text-gray-400 mb-1">{m.indication}</p>}
                <p className={BODY}>{m.text}</p>
              </section>
            ))}
          </div>
        </>
      )}

      {c.results?.length > 0 && (
        <>
          <h2 className={H2}>Results</h2>
          <ul className="space-y-1.5">
            {c.results.map(r => (
              <li key={r.label} className={BODY}><span className="font-semibold">{r.label}: </span>{r.text}</li>
            ))}
          </ul>
        </>
      )}

      {c.cases?.length > 0 && (
        <>
          <h2 className={H2}>Cases</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            {c.cases.map((t, i) => <li key={i} className={BODY}>{t}</li>)}
          </ul>
        </>
      )}

      {c.discussion?.length > 0 && (
        <>
          <h2 className={H2}>Discussion</h2>
          {c.discussion.map((t, i) => <p key={i} className={`${BODY} mb-2`}>{t}</p>)}
        </>
      )}

      {c.sections?.map(sec => (
        <section key={sec.heading}>
          <h2 className={H2}>{sec.heading}</h2>
          {sec.text?.map((t, i) => <p key={i} className={`${BODY} mb-2`}>{t}</p>)}
          {sec.items?.length > 0 && <SectionList items={sec.items} ordered={sec.list === 'ol'} />}
          {sec.table && <SectionTable table={sec.table} />}
          {sec.after?.map((t, i) => <p key={i} className={`${BODY} mt-2`}>{t}</p>)}
          {sec.note && (
            <p className={`${BODY} mt-2 rounded border-l-4 border-amber-500 bg-amber-500/10 px-3 py-2`}>
              <span className="font-semibold">Clinical note: </span>{sec.note}
            </p>
          )}
        </section>
      ))}

      {src?.kind === 'clinic' && (
        <p className="text-gray-500 text-xs leading-relaxed mt-6">Source: {src.title}</p>
      )}
      {src && src.kind !== 'clinic' && (
        <p className="text-gray-500 text-xs leading-relaxed mt-6">
          Reference: <span className="italic">{src.title}</span> by {src.author}
          {src.publisher && `, ${src.publisher}`}{src.year && `, ${src.year}`}.
        </p>
      )}
    </article>
  )
}

// Anyone logged in sees every case; a visitor without an account sees the
// first FREE_CASES, with a note about the rest.
export default function CasesPage({ isGuest = false }) {
  const cases = isGuest ? CASES.slice(0, FREE_CASES) : CASES
  const lockedCount = CASES.length - cases.length
  const [selectedId, setSelectedId] = useState(cases[0]?.id ?? null)
  const [listOpen, setListOpen] = useState(false)
  const [activeTags, setActiveTags] = useState([])
  const selected = cases.find(c => c.id === selectedId)
  const listProps = { cases, lockedCount, selectedId, onSelect: select, activeTags, onToggleTag: toggleTag }

  // Toggle one tag in the filter; null clears it.
  function toggleTag(t) {
    setActiveTags(prev => t === null ? [] : prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  // A tag on the open article: filter by just that tag and show the list.
  function filterByTag(t) {
    setActiveTags([t])
    setListOpen(true)
  }

  function select(id) {
    setSelectedId(id)
    setListOpen(false)
  }

  return (
    <div className="h-full overflow-y-auto md:overflow-hidden scroll-touch">
      <div className="flex flex-col md:flex-row gap-4 md:h-full">
        {/* Desktop list */}
        <aside className="hidden md:block md:w-64 lg:w-72 flex-shrink-0 bg-white dark:bg-gray-950 rounded-lg shadow p-3 overflow-y-auto scroll-touch">
          <CaseList {...listProps} />
        </aside>

        {/* Phone list toggle */}
        <div className="md:hidden bg-white dark:bg-gray-950 rounded-lg shadow p-3">
          <button
            type="button"
            onClick={() => setListOpen(o => !o)}
            className="w-full flex justify-between items-center text-sm font-semibold text-black dark:text-gray-100"
          >
            <span>All cases ({cases.length})</span>
            <span>{listOpen ? '▲' : '▼'}</span>
          </button>
          {listOpen && <div className="mt-2"><CaseList {...listProps} /></div>}
        </div>

        <div className="md:flex-1 md:min-h-0 md:overflow-y-auto scroll-touch">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 rounded-lg shadow p-5 md:p-6">
            {selected ? <Article c={selected} onTagClick={filterByTag} /> : <p className={BODY}>Pick a case from the list.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
