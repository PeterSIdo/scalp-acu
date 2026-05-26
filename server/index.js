import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRouter from './routes/auth.js'
import stripeRouter from './routes/stripe.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const isProd = process.env.NODE_ENV === 'production'

// Stripe webhook needs raw body — must be before express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  // Re-attach to stripe router as raw buffer
  req.rawBody = req.body
  next()
})

app.use(cors({
  origin: isProd ? process.env.APP_URL : 'http://localhost:5173',
  credentials: true,
}))
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/stripe', stripeRouter)

// Serve the React frontend in production
if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${isProd ? 'production' : 'development'}]`)
})
