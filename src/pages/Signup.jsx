import { useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { signUp } from '../data/db.js'
import { useAuth } from '../auth/AuthProvider.jsx'
import { GENERIC_ERROR, signUpMessage } from '../auth/authMessages.js'
import { returnPath } from '../auth/returnPath.js'
import '../components/AuthForm.css'

export default function Signup() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)
  const submitting = useRef(false)

  const target = returnPath(location.state?.from)

  // Signed in already, or just signed up with no email confirmation: go on.
  if (!loading && user) return <Navigate to={target} replace />

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const name = displayName.trim()
    if (!name) {
      setError('Please enter a display name.')
      return
    }
    submitting.current = true
    setPending(true)
    setError('')
    try {
      const { data, error: authError } = await signUp({ email, password, displayName: name })
      if (authError) {
        setError(signUpMessage(authError))
      } else if (!data?.session) {
        // Fallback for when email confirmation is turned on: no session until the link is opened.
        setCheckEmail(true)
      }
    } catch {
      setError(GENERIC_ERROR)
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  if (checkEmail) {
    return (
      <main className="auth-page">
        <h1>Check your email</h1>
        <p className="auth-form__notice" role="status">
          We sent a confirmation link to {email.trim()}. Open it to finish creating your account, then log in.
        </p>
        <p className="auth-page__switch">
          <Link to="/login" state={location.state}>
            Go to log in
          </Link>
        </p>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <h1>Sign up</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form__field">
          <label htmlFor="signup-name">Display name</label>
          <input
            id="signup-name"
            type="text"
            autoComplete="nickname"
            maxLength={50}
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={pending}
            aria-describedby="signup-name-hint"
          />
          <p className="auth-form__hint" id="signup-name-hint">
            Shown next to your logs. Up to 50 characters.
          </p>
        </div>
        <div className="auth-form__field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="auth-form__field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            aria-describedby="signup-password-hint"
          />
          <p className="auth-form__hint" id="signup-password-hint">
            At least 8 characters.
          </p>
        </div>
        {error && (
          <p className="auth-form__error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-page__switch">
        Already have an account?{' '}
        <Link to="/login" state={location.state}>
          Log in
        </Link>
      </p>
    </main>
  )
}
