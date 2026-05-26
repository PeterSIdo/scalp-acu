import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from './useAuth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }
    api.stripe.subscription()
      .then(({ subscription }) => setSubscription(subscription))
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false))
  }, [user])

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const status = subscription?.status ?? 'none'

  return { subscription, loading, isActive, status }
}
