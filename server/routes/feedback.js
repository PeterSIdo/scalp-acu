import { Router } from 'express'
import prisma from '../db.js'
import jwt from 'jsonwebtoken'

const router = Router()

// Keep stored values small and plain: strings, numbers, short string arrays.
function clean(value) {
  if (typeof value === 'string') return value.slice(0, 2000)
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string').slice(0, 20).map(v => v.slice(0, 100))
  return undefined
}

function cleanObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
  const out = {}
  for (const [k, v] of Object.entries(obj).slice(0, 40)) {
    const c = clean(v)
    if (c !== undefined && c !== '') out[k.slice(0, 40)] = c
  }
  return out
}

// The signed-in user, if any. The viewer is open without an account, so
// feedback is accepted from anyone; a valid session just adds the email.
function optionalUser(req) {
  const token = req.cookies?.token
  if (!token) return null
  try { return jwt.verify(token, process.env.JWT_SECRET) } catch { return null }
}

// Simple spam guard: at most RATE_MAX submissions per IP per hour (in memory,
// reset on restart — enough for a small app).
const RATE_MAX = 5
const RATE_WINDOW = 60 * 60 * 1000
const recent = new Map()
function tooMany(ip) {
  const now = Date.now()
  const times = (recent.get(ip) ?? []).filter(t => now - t < RATE_WINDOW)
  if (times.length >= RATE_MAX) { recent.set(ip, times); return true }
  times.push(now)
  recent.set(ip, times)
  if (recent.size > 5000) recent.clear()
  return false
}

router.post('/', async (req, res) => {
  // Honeypot: a hidden field people never see; bots fill it in.
  if (req.body?.website) return res.json({ ok: true })
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip
  if (tooMany(ip)) return res.status(429).json({ error: 'Thanks — you have already sent feedback recently. Please try again later.' })

  const user = optionalUser(req)
  const answers = cleanObject(req.body?.answers)
  const rating = Number(answers.overall)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Please give an overall rating.' })
  }
  await prisma.feedback.create({
    data: {
      userId: user?.userId ?? null,
      // Signed-in email, else the one typed for "May we email you?" (if valid).
      email: user?.email ?? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.contactEmail ?? '') ? answers.contactEmail : null),
      rating,
      answers,
      context: cleanObject(req.body?.context),
    },
  })
  res.json({ ok: true })
})

export default router
