import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { useState } from 'react'

export default function SubscriptionBanner({ status }) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    try {
      const { url } = await api.stripe.createCheckout()
      window.location.href = url
    } catch {
      alert('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  if (status === 'active') return null

  if (status === 'trialing') {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-sm">
        <span className="text-amber-600 dark:text-amber-400">Free trial active</span>
        <span className="text-gray-500 dark:text-gray-400 ml-2">— subscribe before it ends to keep full access.</span>
        <button onClick={handleSubscribe} disabled={loading} className="ml-3 text-amber-600 dark:text-amber-400 underline hover:no-underline">
          Subscribe now
        </button>
      </div>
    )
  }

  if (status === 'past_due') {
    return (
      <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-center text-sm">
        <span className="text-red-500 dark:text-red-400 font-semibold">Payment failed</span>
        <span className="text-gray-500 dark:text-gray-400 ml-2">— please update your payment method.</span>
        <Link to="/account" className="ml-3 text-red-500 dark:text-red-400 underline hover:no-underline">Manage billing</Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-sm flex items-center justify-center gap-3">
      <span className="text-gray-500 dark:text-gray-400">Demo mode — 3 points unlocked.</span>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-4 py-1 rounded-lg text-xs transition-colors"
      >
        {loading ? 'Loading…' : 'Unlock all points'}
      </button>
    </div>
  )
}
