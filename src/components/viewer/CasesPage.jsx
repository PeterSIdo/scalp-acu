import { useState } from 'react'
import { CASES, caseText } from '../../data/cases'
import { SOURCES } from '../../data/sources'

// The "Cases" tab: a searchable list of articles beside the open article.
// On phones the list folds into a toggle above the article. Scrolls on its
// own, outside ZoomableView, like the Ear Description page.

const H2 = 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-5'
const BODY = 'text-black dark:text-gray-300 text-sm leading-relaxed'

function CaseList({ selectedId, onSelect }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const list = q ? CASES.filter(c => caseText(c).includes(q)) : CASES
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search condition, point, method…"
        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-base md:text-sm px-2 py-1.5 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
      />
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
              {c.points?.length > 0 && (
                <span className="block text-[11px] font-normal text-gray-500 dark:text-gray-400">
                  {c.points.map(p => `${p.name} (${p.code})`).join(', ')}
                </span>
              )}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="px-2 py-2 text-xs text-gray-400">No cases match</li>}
      </ul>
    </div>
  )
}

function Article({ c }) {
  const src = c.source && SOURCES[c.source]
  return (
    <article>
      <h1 className="text-xl font-bold text-black dark:text-white">{c.title}</h1>
      {c.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {c.tags.map(t => (
            <span key={t} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#63ECE1]/40 text-black dark:text-gray-200">{t}</span>
          ))}
        </div>
      )}

      {c.points?.length > 0 && (
        <>
          <h2 className={H2}>{c.points.length > 1 ? 'Points' : 'Point'}</h2>
          {c.points.map(p => (
            <div key={p.code} className="mb-2">
              <p className="text-sm font-bold text-black dark:text-gray-100">{p.name} <span className="text-amber-600 dark:text-amber-400">({p.code})</span></p>
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

      {src && (
        <p className="text-gray-500 text-xs leading-relaxed mt-6">
          Reference: <span className="italic">{src.title}</span> by {src.author}
        </p>
      )}
    </article>
  )
}

export default function CasesPage() {
  const [selectedId, setSelectedId] = useState(CASES[0]?.id ?? null)
  const [listOpen, setListOpen] = useState(false)
  const selected = CASES.find(c => c.id === selectedId)

  function select(id) {
    setSelectedId(id)
    setListOpen(false)
  }

  return (
    <div className="h-full overflow-y-auto md:overflow-hidden scroll-touch">
      <div className="flex flex-col md:flex-row gap-4 md:h-full">
        {/* Desktop list */}
        <aside className="hidden md:block md:w-64 lg:w-72 flex-shrink-0 bg-white dark:bg-gray-950 rounded-lg shadow p-3 overflow-y-auto scroll-touch">
          <CaseList selectedId={selectedId} onSelect={select} />
        </aside>

        {/* Phone list toggle */}
        <div className="md:hidden bg-white dark:bg-gray-950 rounded-lg shadow p-3">
          <button
            type="button"
            onClick={() => setListOpen(o => !o)}
            className="w-full flex justify-between items-center text-sm font-semibold text-black dark:text-gray-100"
          >
            <span>All cases ({CASES.length})</span>
            <span>{listOpen ? '▲' : '▼'}</span>
          </button>
          {listOpen && <div className="mt-2"><CaseList selectedId={selectedId} onSelect={select} /></div>}
        </div>

        <div className="md:flex-1 md:min-h-0 md:overflow-y-auto scroll-touch">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 rounded-lg shadow p-5 md:p-6">
            {selected ? <Article c={selected} /> : <p className={BODY}>Pick a case from the list.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
