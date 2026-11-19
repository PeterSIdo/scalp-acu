import { Router } from 'express'
import bcrypt from 'bcrypt'
import prisma from '../db.js'
import { requireAdmin, isAdminEmail } from '../middleware/requireAdmin.js'

const router = Router()
router.use(requireAdmin)

const DAY = 24 * 60 * 60 * 1000

function publicUser(u, feedbackCounts = {}) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    signupRef: u.signupRef,
    disabled: u.disabled,
    isAdmin: isAdminEmail(u.email),
    createdAt: u.createdAt,
    lastSeenAt: u.lastSeenAt,
    subscriptionStatus: u.subscription?.status ?? 'none',
    feedbackCount: feedbackCounts[u.id] ?? 0,
  }
}

router.get('/stats', async (_req, res) => {
  const now = Date.now()
  const [total, last7, last30, active7, disabled, byRef, feedback] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(now - 7 * DAY) } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(now - 30 * DAY) } } }),
    prisma.user.count({ where: { lastSeenAt: { gte: new Date(now - 7 * DAY) } } }),
    prisma.user.count({ where: { disabled: true } }),
    prisma.user.groupBy({ by: ['signupRef'], _count: { _all: true } }),
    prisma.feedback.count(),
  ])
  res.json({
    total, last7, last30, active7, disabled, feedback,
    byRef: byRef
      .map(r => ({ ref: r.signupRef ?? '(direct)', count: r._count._all }))
      .sort((a, b) => b.count - a.count),
  })
})

router.get('/users', async (_req, res) => {
  const [users, counts] = await Promise.all([
    prisma.user.findMany({ include: { subscription: true }, orderBy: { createdAt: 'desc' } }),
    prisma.feedback.groupBy({ by: ['userId'], where: { userId: { not: null } }, _count: { _all: true } }),
  ])
  const feedbackCounts = Object.fromEntries(counts.map(c => [c.userId, c._count._all]))
  res.json({ users: users.map(u => publicUser(u, feedbackCounts)) })
})

router.patch('/users/:id', async (req, res) => {
  const { fullName, email, disabled } = req.body ?? {}
  const data = {}
  if (typeof fullName === 'string') {
    if (!fullName.trim()) return res.status(400).json({ error: 'Name cannot be empty' })
    data.fullName = fullName.trim().slice(0, 200)
  }
  if (typeof email === 'string') {
    const e = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return res.status(400).json({ error: 'Invalid email' })
    const taken = await prisma.user.findUnique({ where: { email: e } })
    if (taken && taken.id !== req.params.id) return res.status(400).json({ error: 'That email is already in use' })
    data.email = e
  }
  if (typeof disabled === 'boolean') {
    if (disabled && req.params.id === req.admin.id) return res.status(400).json({ error: "You can't disable your own account" })
    data.disabled = disabled
  }
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data, include: { subscription: true } })
    res.json({ user: publicUser(user) })
  } catch {
    res.status(404).json({ error: 'User not found' })
  }
})

router.post('/users/:id/password', async (req, res) => {
  const { password } = req.body ?? {}
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash: await bcrypt.hash(password, 12) },
    })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'User not found' })
  }
})

router.delete('/users/:id', async (req, res) => {
  if (req.params.id === req.admin.id) return res.status(400).json({ error: "You can't delete your own account" })
  try {
    // Feedback rows keep their answers but lose the link to the deleted account.
    await prisma.$transaction([
      prisma.subscription.deleteMany({ where: { userId: req.params.id } }),
      prisma.feedback.updateMany({ where: { userId: req.params.id }, data: { userId: null, email: null } }),
      prisma.user.delete({ where: { id: req.params.id } }),
    ])
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'User not found' })
  }
})

router.get('/feedback', async (_req, res) => {
  const rows = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } })
  const ids = [...new Set(rows.map(r => r.userId).filter(Boolean))]
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, fullName: true, email: true } })
  const byId = Object.fromEntries(users.map(u => [u.id, u]))
  res.json({
    feedback: rows.map(r => ({ ...r, userName: byId[r.userId]?.fullName ?? null })),
  })
})

router.delete('/feedback/:id', async (req, res) => {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Feedback not found' })
  }
})

export default router
