import { useState } from 'react'
import { EAR_DESCRIPTION, EAR_FORMULAS, EAR_FORMULA_KEY_TERMS, EAR_FORMULA_SAFETY } from '../../data/earGuide'
import { SOURCES } from '../../data/sources'
import CrossIcon from '../ui/CrossIcon'

// Text pages for the Auriculotherapy "Description" and "Formulas" tabs. They
// scroll on their own, outside ZoomableView.

const H2 = 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2'
const BODY = 'text-black dark:text-gray-300 text-sm leading-relaxed'

function Page({ children }) {
  return (
    <div className="h-full overflow-y-auto scroll-touch">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 rounded-lg shadow p-5 md:p-6">{children}</div>
    </div>
  )
}

function Source({ id }) {
  const src = SOURCES[id]
  if (!src) return null
  return (
    <p className="text-gray-500 dark:text-gray-500 text-xs leading-relaxed mt-6">
      Summarised in our own words from <span className="italic">{src.title}</span> by {src.author}.
    </p>
  )
}

function Safety({ text }) {
  return (
    <p className="bg-amber-500/10 border border-amber-500/30 text-black dark:text-gray-300 text-xs leading-relaxed rounded px-3 py-2 my-4">
      ⚠️ {text}
    </p>
  )
}

export function EarDescription() {
  const d = EAR_DESCRIPTION
  return (
    <Page>
      <h1 className="text-xl font-bold text-black dark:text-white mb-3">{d.title}</h1>
      {d.intro.map((t, i) => <p key={i} className={`${BODY} mb-3`}>{t}</p>)}

      <h2 className={`${H2} mt-5`}>{d.reading.title}</h2>
      <ul className="list-disc pl-5 space-y-1.5 mb-2">
        {d.reading.items.map(item => (
          <li key={item.label} className={BODY}><span className="font-semibold">{item.label}: </span>{item.text}</li>
        ))}
      </ul>

      <h2 className={`${H2} mt-5`}>The six groups of points</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {d.groups.map((g, i) => (
          <section key={g.title} className="rounded border border-gray-200 dark:border-gray-800 p-3">
            <h3 className="text-sm font-bold text-black dark:text-gray-100 mb-1">
              <span className="text-amber-600 dark:text-amber-400 mr-1">{i + 1}.</span>{g.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-400 text-xs leading-relaxed mb-2">{g.summary}</p>
            {g.points.length > 0 && (
              <ul className="space-y-1">
                {g.points.map(p => (
                  <li key={p.name} className="text-xs leading-relaxed text-black dark:text-gray-300">
                    <span className="font-semibold">{p.name}</span> — {p.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <Safety text={d.safety} />
      <Source id={d.source} />
    </Page>
  )
}

const matches = (f, q) =>
  f.name.toLowerCase().includes(q) ||
  f.points.some(p => p.toLowerCase().includes(q)) ||
  f.addOns?.some(a => a.toLowerCase().includes(q))

function PointChip({ name }) {
  const bleed = name.endsWith('(Bleed)')
  const label = bleed ? name.replace(' (Bleed)', '') : name
  return (
    <span className="bg-gray-100 dark:bg-gray-800 text-black dark:text-gray-300 text-xs px-2 py-0.5 rounded">
      {label}{bleed && <span className="ml-1 text-red-600 dark:text-red-400 font-semibold" title="Bleed">●</span>}
    </span>
  )
}

export function EarFormulas() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const families = EAR_FORMULAS
    .map(fam => ({ ...fam, formulas: q ? fam.formulas.filter(f => matches(f, q)) : fam.formulas }))
    .filter(fam => fam.formulas.length > 0)

  return (
    <Page>
      <h1 className="text-xl font-bold text-black dark:text-white mb-2">Point Formulas by Function</h1>
      <p className={`${BODY} mb-3`}>Sets of points with similar effects that work well together. Start with the core points, then add points for the specific cause.</p>

      <ul className="space-y-1 mb-3">
        {EAR_FORMULA_KEY_TERMS.map(t => (
          <li key={t.label} className="text-xs leading-relaxed text-black dark:text-gray-300">
            <span className="font-semibold">{t.label}{t.label === 'Bleed' && <span className="ml-1 text-red-600 dark:text-red-400">●</span>}:</span> {t.text}
          </li>
        ))}
      </ul>

      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter by condition or point…"
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-sm pl-3 pr-8 py-1.5 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow"
            aria-label="Clear"
          ><CrossIcon size={10} strokeWidth={4} /></button>
        )}
      </div>

      {families.map(fam => (
        <section key={fam.family} className="mb-5">
          <h2 className={H2}>{fam.family}</h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-800 border-y border-gray-200 dark:border-gray-800">
            {fam.formulas.map(f => (
              <div key={f.name} className="py-2.5 md:grid md:grid-cols-[11rem_1fr] md:gap-3">
                <p className="text-sm font-semibold text-black dark:text-gray-100 mb-1 md:mb-0">{f.name}</p>
                <div>
                  <div className="flex flex-wrap gap-1">
                    {f.points.map(p => <PointChip key={p} name={p} />)}
                  </div>
                  {f.addOns?.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1.5">
                      <span className="font-semibold">Add: </span>{f.addOns.join(' · ')}
                    </p>
                  )}
                  {f.note && <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{f.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {families.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No formulas match “{query}”.</p>}

      <Safety text={EAR_FORMULA_SAFETY} />
      <Source id="huang-auriculotherapy" />
    </Page>
  )
}
