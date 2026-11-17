import { useState } from 'react'

// Free descriptions a visitor can open before being asked to create an
// account. Counted per different point (re-opening one is free), in this
// browser only — a gentle nudge for the beta, not a lock.
export const GUEST_POINT_LIMIT = 20
// The reminder banner shows once this many free descriptions are left.
export const GUEST_WARN_AT = 5

const STORAGE_KEY = 'acumap.guestPoints'

function load() {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Private mode / blocked storage: the count just lasts for this visit.
  }
}

// The About text and the category intros ("About YNSA", …) are always free.
function counts(point) {
  return point && !point.isCategory && point.id !== 'about-app'
}

const keyOf = point => `${point.system ?? ''}|${point.id ?? point.name}`

// `isGuest` is false while the login check is still loading, so a returning
// user is never stopped by mistake.
export function useGuestAllowance(isGuest) {
  const [seen, setSeen] = useState(load)

  // True if the description may be shown; records new points.
  function allow(point) {
    if (!isGuest || !counts(point)) return true
    const key = keyOf(point)
    if (seen.includes(key)) return true
    if (seen.length >= GUEST_POINT_LIMIT) return false
    const next = [...seen, key]
    setSeen(next)
    save(next)
    return true
  }

  const remaining = isGuest ? Math.max(GUEST_POINT_LIMIT - seen.length, 0) : Infinity
  return { allow, remaining }
}
