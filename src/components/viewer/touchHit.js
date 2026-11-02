// How far (screen px) around a finger tap to look for a target.
export const TOUCH_REACH = 24

// The element carrying `attr` (a data-* attribute name, e.g. 'data-ear-point')
// at a screen position, inside `host` only (elementsFromPoint also returns
// whatever is stacked underneath, such as the grid hidden under an expanded
// card). Fingers land a few pixels off a small dot, so a miss is retried on
// rings around the tap, nearest ring first, up to `reach` px; pass 0 for the
// mouse. Lines and areas can overlap dots, so a circle wins within a ring.
export function targetAt(host, x, y, attr, reach) {
  const selector = `[${attr}]`
  for (let r = 0; r <= reach; r += 6) {
    const steps = r === 0 ? 1 : 12
    const hits = []
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * 2 * Math.PI
      for (const el of document.elementsFromPoint(x + r * Math.cos(a), y + r * Math.sin(a))) {
        const hit = el.closest(selector)
        if (hit && host.contains(hit)) hits.push(hit)
      }
    }
    const el = hits.find(h => h.tagName === 'circle') ?? hits[0]
    if (el) return el
  }
  return null
}
