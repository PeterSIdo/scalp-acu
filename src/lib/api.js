const BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  auth: {
    register: (body) => request('/api/auth/register', { method: 'POST', body }),
    login: (body) => request('/api/auth/login', { method: 'POST', body }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
  },
  stripe: {
    subscription: () => request('/api/stripe/subscription'),
    createCheckout: () => request('/api/stripe/create-checkout', { method: 'POST' }),
    createPortal: () => request('/api/stripe/create-portal', { method: 'POST' }),
  },
}
