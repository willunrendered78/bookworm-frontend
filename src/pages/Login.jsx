import { useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { signIn } from '../data/db.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import { GENERIC_ERROR, signInMessage } from '../auth/authMessages.js'
import { returnPath } from '../auth/returnPath.js'
import '../components/AuthForm.css'

export default function Login() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  const target = returnPath(location.state?.from)

  // Already signed in, or just signed in: onAuthStateChange sets the user and this redirect runs.
  if (!loading && user) return <Navigate to={target} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setPending(true)
    setError('')
    try {
      const { error: authError } = await signIn({ email, password })
      if (authError) setError(signInMessage(authError))
    } catch {
      setError(GENERIC_ERROR)
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <main className="auth-page">
      <h1>Log in</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="auth-form__field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
          />
        </div>
        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending}>
          {pending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="auth-page__switch">
        New here?{' '}
        <Link to="/signup" state={location.state}>
          Create an account
        </Link>
      </p>
    </main>
  )
}
