import { useEffect, useRef, useState } from 'react'
import CrossIcon from './CrossIcon'
import { GLASS_TRIGGER, GLASS_DROPDOWN } from './menuStyles'

// Hamburger (three-line) navigation menu shared by the YNSA and TCM grids'
// menu tiles. Each item either switches which control sits beside the
// hamburger (a dropdown) or acts directly (e.g. opens a category intro in
// the InfoPanel) — the caller decides in onSelect.
//
// items: [{ id, label, disabled?, note? }]. activeId highlights the item
// whose control is currently shown. The dropdown is absolutely positioned
// against the nearest positioned ancestor (the menu row); `dropdownClassName`
// sets its horizontal anchor (e.g. left-3 to clear a padded row).
//
// search (optional) puts a search field at the top of the dropdown, as in
// the Ear grid's point menu: { placeholder, emptyText, compact, matches,
// onPick }. matches(query) returns [{ key, name, hit }] — `hit` is the
// matched phrase (an indication), or null for a name match. While the field
// has text the results replace the menu items; onPick(key) gets the choice.
const ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

// The open dropdown. Mounted only while open, so the search text starts
// empty each time the menu opens.
function MenuPanel({ items, activeId, onSelect, search, dropdownClassName }) {
  const panelRef = useRef(null)
  const fieldRef = useRef(null)
  const listRef = useRef(null)
  const [query, setQuery] = useState('')
  const searching = !!search && query.trim() !== ''
  const matches = searching ? search.matches(query) : []

  // On phones focusing would raise the keyboard over the menu.
  useEffect(() => {
    if (fieldRef.current && window.matchMedia('(pointer: fine)').matches) fieldRef.current.focus({ preventScroll: true })
  }, [])

  // Native wheel-stop so ZoomableView doesn't zoom under the menu; the
  // result list scrolls instead.
  useEffect(() => {
    const el = panelRef.current
    function onWheel(e) {
      e.preventDefault()
      e.stopPropagation()
      if (listRef.current) listRef.current.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Kept from the tile, which treats Enter/Space as "expand".
  function handleKeyDown(e) {
    e.stopPropagation()
    if (e.key === 'Enter') {
      e.preventDefault()
      if (matches.length > 0) search.onPick(matches[0].key)
    } else if (e.key === 'Escape') {
      setQuery('')
    }
  }

  return (
    <div
      ref={panelRef}
      onMouseDown={e => e.stopPropagation()}
      className={`absolute top-full ${dropdownClassName} w-60 mt-1 py-1 ${GLASS_DROPDOWN} z-30`}
    >
      {search && (
        <div className="px-2 pt-1 pb-1.5">
          <label className="flex items-center gap-1.5 px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus-within:border-amber-500 transition-colors cursor-text">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="12.6" y1="12.6" x2="17" y2="17" />
            </svg>
            <input
              ref={fieldRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={search.placeholder}
              aria-label={search.placeholder}
              className="flex-1 min-w-0 bg-transparent text-base md:text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-orange-500 hover:bg-orange-600 text-white transition duration-150 ease-out hover:scale-110 active:scale-90"
              >
                <CrossIcon size={8} strokeWidth={4.5} />
              </button>
            )}
          </label>
        </div>
      )}

      {searching ? (
        <div
          ref={listRef}
          className={`scroll-touch overflow-y-auto border-t border-gray-300/60 dark:border-gray-700/60 pt-1 ${search.compact ? 'max-h-40' : 'max-h-80'}`}
        >
          {matches.length > 0 ? matches.map(match => (
            <button key={match.key} type="button" onClick={() => search.onPick(match.key)} className={ITEM_CLASS(false)}>
              {match.name}
              {match.hit && (
                <span className="block text-[11px] font-normal leading-snug text-gray-500 dark:text-gray-400">{match.hit}</span>
              )}
            </button>
          )) : (
            <p className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500">{search.emptyText}</p>
          )}
        </div>
      ) : (
        <div className={search ? 'border-t border-gray-300/60 dark:border-gray-700/60 pt-1' : undefined}>
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => onSelect(item.id)}
              className={item.disabled
                ? 'block w-full text-left px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : ITEM_CLASS(activeId === item.id)}
            >
              {item.label}
              {item.note && <span className="ml-1.5 text-[11px] font-normal italic">({item.note})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HamburgerMenu({ items, activeId, open, onToggle, onSelect, search = null, dropdownClassName = 'left-0' }) {
  return (
    <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
      {/* h-[26px] matches the search field's height, so swapping controls
          beside the hamburger doesn't change the menu row's height (TCM /
          Brain Zones size their diagrams off that row). */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="Menu"
        aria-expanded={open}
        className={`flex flex-col justify-center gap-[3px] w-7 h-[26px] px-1.5 ${GLASS_TRIGGER} transition-colors ${open ? 'text-red-700' : 'text-black hover:text-red-700'}`}
      >
        <span className="block h-0.5 w-full rounded bg-current" />
        <span className="block h-0.5 w-full rounded bg-current" />
        <span className="block h-0.5 w-full rounded bg-current" />
      </button>

      {open && (
        <MenuPanel items={items} activeId={activeId} onSelect={onSelect} search={search} dropdownClassName={dropdownClassName} />
      )}
    </div>
  )
}
