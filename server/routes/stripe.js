import { Router } from 'express'
import Stripe from 'stripe'
import { authenticate } from '../middleware/authenticate.js'
import prisma from '../db.js'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

router.get('/subscription', authenticate, async (req, res) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user.userId } })
  res.json({ subscription: sub ?? null })
})

router.post('/create-checkout', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
  let sub = await prisma.subscription.findUnique({ where: { userId: user.id } })

  let customerId = sub?.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.fullName })
    customerId = customer.id
    sub = await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, stripeCustomerId: customerId, status: 'none' },
      update: { stripeCustomerId: customerId },
    })
  }

  const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${origin}/viewer?subscribed=true`,
    cancel_url: `${origin}/viewer`,
  })

  res.json({ url: session.url })
})

router.post('/create-portal', authenticate, async (req, res) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user.userId } })
  if (!sub?.stripeCustomerId) return res.status(400).json({ error: 'No billing account found' })

  const origin = process.env.APP_URL || `${req.protocol}://${req.get('host')}`
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${origin}/account`,
  })

  res.json({ url: session.url })
})

// Public route — Stripe calls this directly. Must use raw body for signature verification.
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).send('Webhook signature verification failed')
  }

  const data = event.data.object

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = await stripe.checkout.sessions.retrieve(data.id, { expand: ['subscription'] })
      const customerId = session.customer
      const stripeSub = session.subscription

      await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          stripeSubscriptionId: stripeSub.id,
          status: stripeSub.status,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      })
      break
    }

    case 'customer.subscription.updated':
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: data.customer },
        data: {
          status: data.status,
          currentPeriodEnd: new Date(data.current_period_end * 1000),
        },
      })
      break

    case 'customer.subscription.deleted':
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: data.customer },
        data: { status: 'canceled' },
      })
      break

    case 'invoice.payment_failed':
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: data.customer },
        data: { status: 'past_due' },
      })
      break
  }

  res.json({ received: true })
})

export default router
