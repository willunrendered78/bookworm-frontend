import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

// Wraps /library only. Waits for the session check, then redirects to /login
// and remembers where the user was going.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main>
        <p role="status">Loading…</p>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return children
}
