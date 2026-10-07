// Hamburger (three-line) navigation menu shared by the YNSA and TCM grids'
// menu tiles. Each item either switches which control sits beside the
// hamburger (a dropdown, the search field) or acts directly (e.g. opens a
// category intro in the InfoPanel) — the caller decides in onSelect.
//
// items: [{ id, label, disabled?, note? }]. activeId highlights the item
// whose control is currently shown. The dropdown is absolutely positioned
// against the nearest positioned ancestor (the menu row); `dropdownClassName`
// sets its horizontal anchor (e.g. left-3 to clear a padded row).
const ITEM_CLASS = (active) => `block w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors ${
  active
    ? 'text-amber-500 dark:text-amber-400'
    : 'text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400'
}`

export default function HamburgerMenu({ items, activeId, open, onToggle, onSelect, dropdownClassName = 'left-0' }) {
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
        className={`flex flex-col justify-center gap-[3px] w-7 h-[26px] px-1.5 rounded bg-[#63ECE1] transition-colors ${open ? 'text-red-700' : 'text-black hover:text-red-700'}`}
      >
        <span className="block h-0.5 w-full rounded bg-current" />
        <span className="block h-0.5 w-full rounded bg-current" />
        <span className="block h-0.5 w-full rounded bg-current" />
      </button>

      {open && (
        <div className={`absolute top-full ${dropdownClassName} w-56 mt-1 py-1 rounded shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-30`}>
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
