import { useState } from 'react'

// Whether the first-visit welcome (WelcomeTip) is still to show. It goes
// away for good on "Got it", on its ×, or as soon as a point description
// opens. Remembered in this browser only.

const STORAGE_KEY = 'acumap.welcomeSeen'

function seenBefore() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function useWelcomeTip() {
  const [open, setOpen] = useState(() => !seenBefore())
  function dismiss() {
    if (!open) return
    setOpen(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Blocked storage: it just shows again on the next visit.
    }
  }
  return { open, dismiss }
}
