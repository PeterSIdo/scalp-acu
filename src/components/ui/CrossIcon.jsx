// Close / clear cross drawn as SVG, so it sits exactly in the middle of its
// round button (the × text glyph lands off-centre depending on the font).
export default function CrossIcon({ size = 16, strokeWidth = 3 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path d="M6 6L18 18M18 6L6 18" />
    </svg>
  )
}
