import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { api } from '../lib/api'
import { useNavigate, Link } from 'react-router-dom'

const STATUS_LABELS = {
  active:    { label: 'Active',          color: 'text-green-500 dark:text-green-400' },
  trialing:  { label: 'Free Trial',      color: 'text-amber-500 dark:text-amber-400' },
  past_due:  { label: 'Payment Due',     color: 'text-red-500 dark:text-red-400'     },
  canceled:  { label: 'Cancelled',       color: 'text-gray-400 dark:text-gray-500'   },
  none:      { label: 'No Subscription', color: 'text-gray-400 dark:text-gray-500'   },
}

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { subscription, loading, status } = useSubscription()
  const navigate = useNavigate()

  async function handleSignOut() {
    await logout()
    navigate('/')
  }

  async function handleManageBilling() {
    try {
      const { url } = await api.stripe.createPortal()
      window.location.href = url
    } catch {
      alert('Could not open billing portal. Please try again.')
    }
  }

  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.none

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/viewer" className="text-amber-500 dark:text-amber-400 font-bold text-xl">ScalpAcu</Link>
          <button onClick={handleSignOut} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors">
            Sign out
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Account</h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Profile</h2>
          <p className="text-gray-900 dark:text-white">{user?.fullName || '—'}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Subscription</h2>
          {loading ? (
            <p className="text-gray-400 dark:text-gray-500">Loading…</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 dark:text-gray-300">Status</span>
                <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
              </div>
              {subscription?.currentPeriodEnd && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700 dark:text-gray-300">
                    {status === 'canceled' ? 'Access until' : 'Next billing date'}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
              {subscription ? (
                <button
                  onClick={handleManageBilling}
                  className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Manage Billing
                </button>
              ) : (
                <Link
                  to="/viewer"
                  className="block text-center w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition-colors"
                >
                  Subscribe to get full access
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
