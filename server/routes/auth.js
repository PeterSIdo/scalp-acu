import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../db.js'
import { isAdminEmail } from '../middleware/requireAdmin.js'
import { clientIp, loginBlockedFor, recordLoginFailure, clearLoginFailures } from '../middleware/loginLimiter.js'

const router = Router()

function publicUser(user) {
  return { id: user.id, email: user.email, fullName: user.fullName, isAdmin: isAdminEmail(user.email) }
}

const HOUR = 60 * 60 * 1000
function touchLastSeen(user) {
  if (user.lastSeenAt && Date.now() - user.lastSeenAt.getTime() < HOUR) return
  prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => {})
}
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

router.post('/register', async (req, res) => {
  const { email, password, fullName, ref } = req.body
  // Same rule as src/lib/signupRef.js; anything else is dropped.
  const signupRef = typeof ref === 'string' && /^[a-z0-9_-]{1,40}$/.test(ref) ? ref : null
  if (!email || !password || !fullName) return res.status(400).json({ error: 'All fields required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return res.status(400).json({ error: 'An account with this email already exists' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, fullName, signupRef, lastSeenAt: new Date() },
  })

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTS)
  res.json({ user: publicUser(user) })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const key = String(email).toLowerCase()
  const ip = clientIp(req)
  const wait = loginBlockedFor(key, ip)
  if (wait) {
    return res.status(429).json({ error: `Too many failed sign-in attempts. Please try again in ${wait} minute${wait === 1 ? '' : 's'}.` })
  }

  const user = await prisma.user.findUnique({ where: { email: key } })
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!valid) {
    recordLoginFailure(key, ip)
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  clearLoginFailures(key)
  if (user.disabled) return res.status(403).json({ error: 'This account has been disabled. Please contact support.' })
  touchLastSeen({ ...user, lastSeenAt: null })

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTS)
  res.json({ user: publicUser(user) })
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token', COOKIE_OPTS)
  res.json({ ok: true })
})

router.get('/me', async (req, res) => {
  const token = req.cookies?.token
  if (!token) return res.json({ user: null })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.disabled) return res.json({ user: null })
    touchLastSeen(user)
    res.json({ user: publicUser(user) })
  } catch {
    res.json({ user: null })
  }
})

export default router
