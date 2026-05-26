import { useState, useEffect, createContext, useContext } from 'react'
import { api } from '../lib/api'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthState() {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    api.auth.me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
  }, [])

  async function login(email, password) {
    const { user } = await api.auth.login({ email, password })
    setUser(user)
  }

  async function register(email, password, fullName) {
    const { user } = await api.auth.register({ email, password, fullName })
    setUser(user)
  }

  async function logout() {
    await api.auth.logout()
    setUser(null)
  }

  return { user, login, register, logout, loading: user === undefined }
}
