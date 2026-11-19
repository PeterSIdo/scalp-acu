// Limits failed sign-in attempts, in memory (reset on restart — enough for a
// single-server app). Counted per email (guessing one account's password) and
// per IP (one client trying many accounts). Only failures count; a successful
// sign-in clears that email's count.
const WINDOW = 15 * 60 * 1000
const MAX_PER_EMAIL = 5
const MAX_PER_IP = 20

const byEmail = new Map()
const byIp = new Map()

function recent(map, key, now) {
  const times = (map.get(key) ?? []).filter(t => now - t < WINDOW)
  if (times.length) map.set(key, times); else map.delete(key)
  return times
}

export function clientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip
}

// Minutes until the caller may try again, or 0 if not blocked.
export function loginBlockedFor(email, ip) {
  const now = Date.now()
  const e = recent(byEmail, email, now)
  const i = recent(byIp, ip, now)
  const waits = []
  if (e.length >= MAX_PER_EMAIL) waits.push(e[0] + WINDOW - now)
  if (i.length >= MAX_PER_IP) waits.push(i[0] + WINDOW - now)
  return waits.length ? Math.ceil(Math.max(...waits) / 60000) : 0
}

export function recordLoginFailure(email, ip) {
  const now = Date.now()
  if (byEmail.size > 10000) byEmail.clear()
  if (byIp.size > 10000) byIp.clear()
  byEmail.set(email, [...recent(byEmail, email, now), now])
  byIp.set(ip, [...recent(byIp, ip, now), now])
}

export function clearLoginFailures(email) {
  byEmail.delete(email)
}
