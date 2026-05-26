import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../db.js'

const router = Router()
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body
  if (!email || !password || !fullName) return res.status(400).json({ error: 'All fields required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return res.status(400).json({ error: 'An account with this email already exists' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), passwordHash, fullName },
  })

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTS)
  res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.cookie('token', token, COOKIE_OPTS)
  res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } })
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
    if (!user) return res.json({ user: null })
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName } })
  } catch {
    res.json({ user: null })
  }
})

export default router
