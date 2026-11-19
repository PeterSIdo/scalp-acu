import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import AdminNav from '../components/layout/AdminNav'
import { FEEDBACK_QUESTIONS } from '../data/feedbackForm'

const card = 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800'
const input = 'bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white'
const btnDanger = 'text-xs font-semibold px-2.5 py-1 rounded-md border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50'

const QUESTION_BY_ID = Object.fromEntries(FEEDBACK_QUESTIONS.map(q => [q.id, q]))
const STAR_QS = FEEDBACK_QUESTIONS.filter(q => q.type === 'stars')
const CHOICE_QS = FEEDBACK_QUESTIONS.filter(q => q.type === 'choice' || q.type === 'multi')
const TEXT_IDS = FEEDBACK_QUESTIONS.filter(q => q.type === 'text').map(q => q.id)
// Answer keys that aren't questions of their own (shown elsewhere or not useful).
const HIDDEN_KEYS = new Set(['contactEmail'])

function Stars({ n }) {
  return (
    <span className="text-amber-500 tracking-tight" aria-label={`${n} of 5`}>
      {'★'.repeat(n)}<span className="text-gray-300 dark:text-gray-700">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

function fmtDateTime(d) {
  return new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function answerText(q, v) {
  if (Array.isArray(v)) return v.join(', ')
  return String(v)
}

function Summary({ items }) {
  if (!items.length) return null
  const avg = id => {
    const vals = items.map(f => Number(f.answers?.[id])).filter(n => n >= 1 && n <= 5)
    return vals.length ? { avg: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length } : null
  }
  const tally = q => {
    const counts = Object.fromEntries((q.options ?? []).map(o => [o, 0]))
    let answered = 0
    for (const f of items) {
      const v = f.answers?.[q.id]
      if (v == null || v === '') continue
      answered++
      for (const o of Array.isArray(v) ? v : [v]) counts[o] = (counts[o] ?? 0) + 1
    }
    return { counts, answered }
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 mb-4">
      <div className={`${card} p-4`}>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Average ratings</div>
        <ul className="space-y-2">
          {STAR_QS.map(q => {
            const a = avg(q.id)
            return (
              <li key={q.id} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-gray-600 dark:text-gray-300">{q.label}</span>
                <span className="whitespace-nowrap tabular-nums font-semibold text-gray-900 dark:text-white">
                  {a ? <>{a.avg.toFixed(1)} <span className="text-gray-400 font-normal">· {a.n}</span></> : '—'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className={`${card} p-4`}>
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Answers</div>
        <ul className="space-y-3">
          {CHOICE_QS.map(q => {
            const { counts, answered } = tally(q)
            if (!answered) return null
            return (
              <li key={q.id} className="text-sm">
                <div className="text-gray-600 dark:text-gray-300 mb-1">{q.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(counts).map(([opt, c]) => (
                    <span key={opt} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {opt} <span className="font-semibold tabular-nums">{c}</span>
                    </span>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function FeedbackCard({ f, onDelete, busy }) {
  const answers = f.answers ?? {}
  const textAnswers = TEXT_IDS.filter(id => answers[id])
  const other = Object.entries(answers).filter(([k, v]) =>
    k !== 'overall' && !TEXT_IDS.includes(k) && !HIDDEN_KEYS.has(k) && v !== '' && v != null)
  const ctx = Object.entries(f.context ?? {})

  return (
    <li className={`${card} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Stars n={f.rating} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{fmtDateTime(f.createdAt)}</span>
          </div>
          <div className="text-sm mt-0.5">
            <span className="text-gray-900 dark:text-white font-medium">{f.userName ?? (f.userId ? 'Deleted user' : 'Guest')}</span>
            {f.email && (
              <a href={`mailto:${f.email}`} className="ml-2 text-amber-600 dark:text-amber-400 hover:underline break-all">{f.email}</a>
            )}
            {answers.contact === 'Yes' && f.email && <span className="ml-2 text-xs text-teal-600 dark:text-teal-400">ok to email</span>}
          </div>
        </div>
        <button className={btnDanger} disabled={busy} onClick={() => onDelete(f)}>Delete</button>
      </div>

      {textAnswers.length > 0 && (
        <div className="space-y-3 mb-3">
          {textAnswers.map(id => (
            <div key={id}>
              <div className="text-xs font-semibold text-gray-400">{QUESTION_BY_ID[id].label}</div>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{answers[id]}</p>
            </div>
          ))}
        </div>
      )}

      {other.length > 0 && (
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {other.map(([k, v]) => {
            const q = QUESTION_BY_ID[k]
            return (
              <div key={k} className="flex justify-between gap-3 border-b border-gray-100 dark:border-gray-800 py-1">
                <dt className="text-gray-500 dark:text-gray-400">{q?.label ?? k}</dt>
                <dd className="text-gray-900 dark:text-white text-right">
                  {q?.type === 'stars' ? <Stars n={Number(v)} /> : answerText(q, v)}
                </dd>
              </div>
            )
          })}
        </dl>
      )}

      {ctx.length > 0 && (
        <div className="mt-3 text-xs text-gray-400">
          {ctx.map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' · ')}
        </div>
      )}
    </li>
  )
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [rating, setRating] = useState('all')
  const [onlyText, setOnlyText] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [params, setParams] = useSearchParams()
  const userFilter = params.get('user')

  function load() {
    api.admin.feedback()
      .then(({ feedback }) => { setItems(feedback); setError(null) })
      .catch(err => setError(err.message))
  }
  useEffect(load, [])

  const shown = useMemo(() => {
    if (!items) return []
    const q = query.trim().toLowerCase()
    return items.filter(f => {
      if (userFilter && f.userId !== userFilter) return false
      if (rating !== 'all' && String(f.rating) !== rating) return false
      if (onlyText && !TEXT_IDS.some(id => f.answers?.[id])) return false
      if (!q) return true
      const hay = [f.email, f.userName, ...TEXT_IDS.map(id => f.answers?.[id])].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [items, query, rating, onlyText, userFilter])

  async function remove(f) {
    if (!window.confirm('Delete this feedback permanently?')) return
    setBusyId(f.id)
    try {
      await api.admin.deleteFeedback(f.id)
      setItems(list => list.filter(x => x.id !== f.id))
    } catch (err) { window.alert(err.message) } finally { setBusyId(null) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <AdminNav onRefresh={load} />
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Feedback</h1>

        {error && <div className={`${card} p-4 mb-4 text-red-600 dark:text-red-400`}>{error}</div>}

        <Summary items={shown} />

        <div className={`${card} flex flex-wrap items-center gap-2 p-4 mb-4`}>
          <input className={`${input} flex-1 min-w-[12rem]`} placeholder="Search comments, name or email…"
            value={query} onChange={e => setQuery(e.target.value)} />
          <select className={input} value={rating} onChange={e => setRating(e.target.value)}>
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" checked={onlyText} onChange={e => setOnlyText(e.target.checked)} />
            With comments only
          </label>
          {userFilter && (
            <button onClick={() => setParams({})}
              className="text-sm px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              One user only ✕
            </button>
          )}
        </div>

        {!items && !error && <div className="text-gray-400">Loading…</div>}
        {items && shown.length === 0 && <div className="text-gray-400">No feedback matches.</div>}

        <ul className="space-y-3">
          {shown.map(f => <FeedbackCard key={f.id} f={f} onDelete={remove} busy={busyId === f.id} />)}
        </ul>
        {items && <p className="text-xs text-gray-400 mt-3">Showing {shown.length} of {items.length}.</p>}
      </div>
    </div>
  )
}
