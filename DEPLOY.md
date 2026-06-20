# ScalpAcu — Railway Deployment Guide

## Prerequisites

- [GitHub account](https://github.com)
- [Railway account](https://railway.app)
- [Stripe account](https://stripe.com) with a subscription product and price created
- Node.js installed locally

---

## Step 1 — Generate a JWT Secret

Run this once locally to generate a secure secret you'll need in Step 4:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output — you'll paste it as `JWT_SECRET` in Railway.

---

## Step 2 — Push code to GitHub

From inside the `scalp-app` folder:

```bash
git init
git add .
git commit -m "Initial commit"
```

Go to **github.com → New repository**, name it (e.g. `scalp-acu`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/scalp-acu.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `scalp-acu` repository
4. Railway detects `railway.toml` automatically — no extra config needed

---

## Step 4 — Add a PostgreSQL database

Inside your Railway project:

1. Click **+ New → Database → PostgreSQL**
2. Railway creates the database and automatically sets `DATABASE_URL` in your service's environment variables

---

## Step 5 — Set environment variables

In your Railway service → **Variables** tab, add the following:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | the value you generated in Step 1 |
| `STRIPE_SECRET_KEY` | from Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | from Stripe Dashboard → Webhooks (see Step 6) |
| `STRIPE_PRICE_ID` | from Stripe Dashboard → Products → your subscription price ID |
| `APP_URL` | your Railway public URL — set this after the first deploy (see Step 7) |

> `DATABASE_URL` is set automatically by Railway when you add the PostgreSQL service.

---

## Step 6 — Configure Stripe Webhook

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to:
   ```
   https://your-app.up.railway.app/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and paste it as `STRIPE_WEBHOOK_SECRET` in Railway Variables

---

## Step 7 — First deploy

Railway deploys automatically once the GitHub repo is connected and variables are set.

The build process runs in this order:
1. `npm install`
2. `npm run build` — builds the React frontend with Vite
3. `npx prisma generate` — generates the Prisma client
4. `npx prisma db push` — creates the database tables
5. `node server/index.js` — starts the Express server (serves the frontend + API)

Watch the build logs in Railway for any errors.

---

## Step 8 — Set APP_URL and redeploy

1. Once deployed, Railway shows your public URL (e.g. `https://scalp-acu.up.railway.app`)
2. Go to **Variables** → set `APP_URL` to that full URL (no trailing slash)
3. Click **Redeploy** (or push any change to trigger a new deploy)

---

## Ongoing deploys

Every `git push` to the `main` branch triggers an automatic redeploy on Railway:

```bash
git add .
git commit -m "your message"
git push
```

---

## Environment variables reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | Auto-set by Railway PostgreSQL service |
| `NODE_ENV` | Set to `production` |
| `JWT_SECRET` | Long random string for signing auth tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRICE_ID` | Stripe price ID for the subscription (`price_...`) |
| `APP_URL` | Full public URL of your Railway app |

---

## Troubleshooting

**Build fails at `prisma db push`**
→ Check that `DATABASE_URL` is set correctly in Railway Variables (it should be auto-set by the PostgreSQL service)

**App loads but login/register fails**
→ Check `JWT_SECRET` is set and `NODE_ENV=production`

**CORS errors in browser**
→ Check `APP_URL` exactly matches your Railway public URL (no trailing slash)

**Stripe payments not working**
→ Verify `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET` are all set correctly

**White screen / 404 on page refresh**
→ This is handled by the Express catch-all in `server/index.js` — if it happens, check the build completed successfully and `dist/` was generated
