// Sign-up source tracking for the beta: links posted in Facebook groups carry
// `?ref=<tag>` (e.g. app.acumap.net/?ref=fb-ynsa). The first tag a visitor
// arrives with is kept in localStorage and sent with the registration, so
// each new account records which post brought it in.
const KEY = 'acumap.ref'

export function cleanRef(value) {
  const ref = String(value ?? '').trim().toLowerCase()
  return /^[a-z0-9_-]{1,40}$/.test(ref) ? ref : null
}

// Called once at startup. Keeps the first tag seen (first touch wins) and
// removes `ref` from the address bar so copied links don't spread it.
export function captureSignupRef() {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('ref')) return
    const ref = cleanRef(url.searchParams.get('ref'))
    if (ref && !localStorage.getItem(KEY)) localStorage.setItem(KEY, ref)
    url.searchParams.delete('ref')
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
  } catch { /* storage blocked: sign-up just goes untagged */ }
}

export function getSignupRef() {
  try { return cleanRef(localStorage.getItem(KEY)) } catch { return null }
}
