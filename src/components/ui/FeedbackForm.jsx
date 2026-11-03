import { useEffect, useState } from 'react'
import { FEEDBACK_QUESTIONS } from '../../data/feedbackForm'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import CrossIcon from './CrossIcon'

// Feedback form, opened from the top bar's menu. Full screen on phones, a
// centred card on larger screens. `context` (which system/tab was open) is
// saved with the answers.

const LABEL = 'block text-sm font-semibold text-black dark:text-gray-100 mb-2'
const CHIP = on => `px-3 py-1.5 rounded-full text-sm border transition-colors ${
  on
    ? 'bg-amber-500 border-amber-500 text-white'
    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-amber-500'
}`

function Stars({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} of 5`}
          onClick={() => onChange(value === n ? undefined : n)}
          className={`text-3xl leading-none transition-transform active:scale-90 ${n <= (value ?? 0) ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}
        >★</button>
      ))}
    </div>
  )
}

function Question({ q, value, onChange }) {
  return (
    <div className="mb-5">
      <span className={LABEL}>
        {q.label}{q.required && <span className="text-red-600"> *</span>}
      </span>
      {q.type === 'stars' && <Stars value={value} onChange={onChange} />}
      {q.type === 'choice' && (
        <div className="flex flex-wrap gap-2">
          {q.options.map(o => (
            <button key={o} type="button" onClick={() => onChange(value === o ? undefined : o)} className={CHIP(value === o)}>{o}</button>
          ))}
        </div>
      )}
      {q.type === 'multi' && (
        <div className="flex flex-wrap gap-2">
          {q.options.map(o => {
            const on = value?.includes(o)
            return (
              <button
                key={o}
                type="button"
                onClick={() => onChange(on ? value.filter(v => v !== o) : [...(value ?? []), o])}
                className={CHIP(on)}
              >{o}</button>
            )
          })}
        </div>
      )}
      {q.type === 'text' && (
        <textarea
          rows={3}
          maxLength={2000}
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder={q.placeholder}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-base md:text-sm px-3 py-2 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
      )}
    </div>
  )
}

export default function FeedbackForm({ context, onClose }) {
  const [answers, setAnswers] = useState({})
  const [status, setStatus] = useState('editing') // editing | sending | sent
  const [error, setError] = useState(null)
  const [honeypot, setHoneypot] = useState('')
  const { user } = useAuth()
  const missing = FEEDBACK_QUESTIONS.filter(q => q.required && answers[q.id] == null)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e) {
    e.preventDefault()
    if (missing.length) { setError('Please give an overall rating (the stars at the top).'); return }
    setStatus('sending')
    setError(null)
    try {
      await api.feedback.submit({
        answers,
        website: honeypot,
        context: { ...context, screenWidth: window.innerWidth },
      })
      setStatus('sent')
    } catch (err) {
      setError(err.message || 'Could not send. Please try again.')
      setStatus('editing')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex md:items-center md:justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        onClick={e => e.stopPropagation()}
        className="flex flex-col w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-xl bg-white dark:bg-gray-950 shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 id="feedback-title" className="text-lg font-bold text-black dark:text-white">Feedback</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow"
          ><CrossIcon size={14} strokeWidth={3.5} /></button>
        </div>

        {status === 'sent' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="text-5xl mb-4">🙏</div>
            <p className="text-lg font-semibold text-black dark:text-white mb-2">Thank you!</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Your feedback helps make AcuMap better.</p>
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto scroll-touch px-5 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Takes about two minutes. Only the first question is required — skip anything you like.
              </p>
              {FEEDBACK_QUESTIONS.map(q => (
                <Question key={q.id} q={q} value={answers[q.id]} onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))} />
              ))}
              {/* Not signed in and happy to be contacted: ask where to. */}
              {answers.contact === 'Yes' && !user && (
                <div className="mb-5 -mt-2">
                  <input
                    type="email"
                    maxLength={200}
                    value={answers.contactEmail ?? ''}
                    onChange={e => setAnswers(a => ({ ...a, contactEmail: e.target.value }))}
                    placeholder="Your email (optional)"
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200 text-base md:text-sm px-3 py-2 rounded border border-gray-300 dark:border-gray-700 focus:border-amber-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
              )}
              {/* Spam trap: hidden from people, filled in by bots. */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={e => setHoneypot(e.target.value)} className="hidden" />
            </div>
            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
              {error && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold"
              >{status === 'sending' ? 'Sending…' : 'Send feedback'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
