import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Client-side guard only, for convenience: the /api/admin routes check admin
// rights on the server.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!user.isAdmin) return <Navigate to="/viewer" replace />
  return children
}
