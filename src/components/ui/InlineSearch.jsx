import { useEffect, useLayoutEffect, useRef } from 'react'

const ITEM_CLASS = 'block w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'

// Always-visible search field shared by the YNSA and TCM grids: magnifier
// icon + text field (no trigger button), results dropping down under the
// menu row. The caller does the matching and passes `matches` as
// { key, name, hit } — `hit` is the matched phrase (indication), or null for
// a name match.
//
// Picking a result puts its full text in the field (the hit, else the name)
// so the field shows what was selected, not the partial query. The list only
// shows while `open` (typing / focused); the caller closes it on select or
// outside click. Focusing selects the field's text so typing starts a fresh
// search; the × calls onClear, which should empty the query and drop the
// current selection.
//
// The field is a one-row textarea: it widens with its text (placeholder
// length at minimum) up to the row's free space, then wraps and grows
// taller, so a long picked indication stays fully visible.
//
// The dropdown is absolutely positioned against the nearest positioned
// ancestor (the menu row); `dropdownClassName` sets its horizontal span.
export default function InlineSearch({
  query, open, matches, placeholder, emptyText, compact,
  onOpen, onQueryChange, onPick, onClear,
  dropdownClassName = 'left-0 right-0',
  autoFocus = false,
}) {
  const listRef = useRef(null)
  const fieldRef = useRef(null)
  const showResults = open && query.trim() !== ''

  useLayoutEffect(() => {
    const el = fieldRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [query])

  // Native (non-React) wheel listener — ZoomableView attaches its own
  // wheel-to-zoom handler directly to a DOM node and sees the real
  // bubble-phase event before a React onWheel would.
  useEffect(() => {
    const el = listRef.current
    if (!showResults || !el) return
    function onWheel(e) {
      e.preventDefault()
      e.stopPropagation()
      el.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [showResults])

  function pick(match) {
    onQueryChange(match.hit ?? match.name)
    onPick(match.key)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); if (matches.length > 0) pick(matches[0]) }
    else if (e.key === 'Escape') onQueryChange('')
  }

  const minChars = placeholder.length - 3

  return (
    <>
      <label
        style={{ flex: '0 1 auto', width: `calc(${Math.max(minChars, query.length + 2)}ch + 2.5rem)` }}
        className="flex items-start gap-1.5 min-w-0 px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus-within:border-amber-500 transition-colors cursor-text"
      >
        <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 mt-px flex-shrink-0 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <line x1="12.6" y1="12.6" x2="17" y2="17" />
        </svg>
        <textarea
          ref={fieldRef}
          rows={1}
          autoFocus={autoFocus}
          value={query}
          title={query || undefined}
          onChange={e => { onQueryChange(e.target.value); onOpen() }}
          onFocus={e => { e.target.select(); onOpen() }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 min-w-0 resize-none overflow-hidden leading-4 bg-transparent text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={e => { e.preventDefault(); onClear() }}
            aria-label="Clear search"
            className="flex-shrink-0 mt-px text-xs font-semibold leading-none text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            ×
          </button>
        )}
      </label>

      {showResults && (
        <div
          ref={listRef}
          className={`inline-search-scroll absolute top-full ${dropdownClassName} mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto z-20 ${compact ? 'max-h-40' : 'max-h-96'}`}
        >
          {matches.length > 0 ? matches.map(match => (
            <button key={match.key} type="button" onClick={() => pick(match)} className={ITEM_CLASS}>
              {match.name}
              {match.hit && (
                <span className="block text-[11px] font-normal leading-snug text-gray-500 dark:text-gray-400">{match.hit}</span>
              )}
            </button>
          )) : (
            <p className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500">{emptyText}</p>
          )}
        </div>
      )}
      <style>{`
        .inline-search-scroll { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; touch-action: pan-y; overscroll-behavior: contain; }
        .inline-search-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  )
}
