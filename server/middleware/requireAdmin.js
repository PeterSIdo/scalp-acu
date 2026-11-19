import jwt from 'jsonwebtoken'
import prisma from '../db.js'

// Admins are listed by email in the ADMIN_EMAILS env var (comma-separated).
export function isAdminEmail(email) {
  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return !!email && admins.includes(email.toLowerCase())
}

// Checks the session against the database (not just the token), so an admin
// whose email changed or who was disabled loses access straight away.
export async function requireAdmin(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  let payload
  try { payload = jwt.verify(token, process.env.JWT_SECRET) } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || user.disabled || !isAdminEmail(user.email)) {
    return res.status(403).json({ error: 'Admins only' })
  }
  req.admin = user
  next()
}
