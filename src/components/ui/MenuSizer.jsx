// Invisible, zero-height copy of a menu's labels. Placed in the same grid
// column as the trigger button (with the absolute dropdown anchored to that
// column), it makes the button and dropdown as wide as the longest label.
// The right padding leaves room for the trigger's ▼ arrow, so the button
// doesn't change width as the selection changes.
export default function MenuSizer({ labels }) {
  return (
    <div aria-hidden="true" className="h-0 overflow-hidden invisible whitespace-nowrap">
      {labels.map((label, i) => (
        <div key={i} className="pl-2 pr-6 text-xs font-semibold">{label}</div>
      ))}
    </div>
  )
}
