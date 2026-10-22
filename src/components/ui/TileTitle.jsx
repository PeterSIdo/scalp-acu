import { GLASS_STRIP } from './menuStyles'

// Grid tile title: a bottom strip in frosted acrylic teal with black text,
// so the tile's menu row can sit at its very top. `className` adds extras,
// e.g. rounded bottom corners on tiles that don't clip their overflow.
export default function TileTitle({ children, className = '' }) {
  return (
    <div className={`text-xs font-semibold text-black text-center px-2 py-1 flex-shrink-0 ${GLASS_STRIP} ${className}`}>
      {children}
    </div>
  )
}
