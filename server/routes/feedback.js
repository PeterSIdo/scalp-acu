import { Router } from 'express'
import prisma from '../db.js'
import { authenticate } from '../middleware/authenticate.js'

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

// Signed-in users only, so the form can't be spammed anonymously.
router.post('/', authenticate, async (req, res) => {
  const answers = cleanObject(req.body?.answers)
  const rating = Number(answers.overall)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Please give an overall rating.' })
  }
  await prisma.feedback.create({
    data: {
      userId: req.user.userId,
      email: req.user.email,
      rating,
      answers,
      context: cleanObject(req.body?.context),
    },
  })
  res.json({ ok: true })
})

export default router
