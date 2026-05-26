import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, name)
      navigate('/viewer')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="text-amber-400 text-xl font-bold block text-center mb-8">ScalpAcu</Link>
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h1 className="text-2xl font-bold mb-2 text-center">Start your free trial</h1>
          <p className="text-gray-400 text-sm text-center mb-6">14 days free, no credit card needed</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
