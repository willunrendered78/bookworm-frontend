import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from '../data/db.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import './Nav.css'

export default function Nav() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function handleSignOut() {
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    setError('')
    try {
      const { error: authError } = await signOut()
      if (authError) setError('Could not log out. Please try again.')
      else navigate('/')
    } catch {
      setError('Could not log out. Please try again.')
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <header className="nav">
      <nav className="nav__inner" aria-label="Main">
        <Link to="/" className="nav__brand">
          BookWorm
        </Link>
        <Link to="/search">Search</Link>
        <Link to="/library">My Library</Link>
        <span className="nav__spacer" />
        {/* Nothing in this slot until the session check finishes, so it never flashes the wrong state. */}
        {!loading && user && (
          <>
            <span className="nav__name">{profile?.display_name ?? 'Account'}</span>
            <button type="button" onClick={handleSignOut} disabled={pending}>
              {pending ? 'Logging out…' : 'Log out'}
            </button>
          </>
        )}
        {!loading && !user && (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>
      {error && (
        <p className="nav__error" role="alert">
          {error}
        </p>
      )}
    </header>
  )
}
