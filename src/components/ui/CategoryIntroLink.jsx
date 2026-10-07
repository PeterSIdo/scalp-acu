import { CATEGORY_INTROS } from '../../data/categoryIntros'

// Plain text link ("About Y Points") pinned to the bottom-left of a grid's
// top-left tile. Opens the category intro in the InfoPanel by handing it to
// onSelect like any point record. stopPropagation keeps the click from also
// expanding the tile underneath.
// `className` replaces the default bottom-left positioning, e.g. when
// several links share one positioned row.
export default function CategoryIntroLink({ subgroupId, onSelect, className = 'absolute left-3 bottom-2 z-10' }) {
  const intro = CATEGORY_INTROS[subgroupId]
  if (!intro) return null
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onSelect?.(intro) }}
      className={`${className} text-xs font-semibold text-gray-700 underline underline-offset-2 hover:text-red-700 transition-colors`}
    >
      {intro.linkLabel}
    </button>
  )
}
