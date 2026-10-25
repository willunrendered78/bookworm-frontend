import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { dbMessage } from '../lib/dbMessages.js'
import InlineConfirm from './InlineConfirm.jsx'
import './LibraryControls.css'

export const STATUSES = [
  { value: 'want_to_read', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
]

// Add, status and remove for one book. library comes from useLibraryItem.
// logCount is how many of my logs for this book exist, so the confirm can say they go too.
export default function LibraryControls({ library, logCount = 0, onRemoved }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [confirming, setConfirming] = useState(false)

  if (loading) return null

  if (!user) {
    return (
      <p className="library-controls">
        <Link to="/login" state={{ from: location.pathname + location.search }}>
          Sign in to add this book
        </Link>
      </p>
    )
  }

  const { item, status, error, pending, actionError } = library

  if (status === 'loading' || status === 'idle') {
    return <p className="library-controls library-controls__note">Checking your library…</p>
  }
  if (status === 'error') {
    return (
      <div className="library-controls">
        <p className="library-controls__error" role="alert">
          {dbMessage(error)}
        </p>
        <button type="button" onClick={library.reload}>
          Retry
        </button>
      </div>
    )
  }

  async function handleRemove() {
    const ok = await library.remove()
    if (ok) {
      setConfirming(false)
      onRemoved?.()
    }
  }

  const logWarning =
    logCount > 0
      ? `This also deletes your ${logCount} ${logCount === 1 ? 'log' : 'logs'} for this book.`
      : 'Any logs you wrote for it would also be deleted.'

  return (
    <div className="library-controls">
      {!item ? (
        <button type="button" onClick={library.add} disabled={pending}>
          {pending ? 'Adding…' : 'Add to library'}
        </button>
      ) : (
        <>
          <p className="library-controls__label">In your library</p>
          <label className="library-controls__status">
            <span>Status</span>
            <select value={item.status} onChange={(e) => library.setStatus(e.target.value)} disabled={pending || confirming}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {!confirming && (
            <button type="button" className="button-secondary" onClick={() => setConfirming(true)} disabled={pending}>
              Remove from library
            </button>
          )}
          {confirming && (
            <InlineConfirm
              message={`Remove this book from your library? ${logWarning}`}
              confirmLabel="Remove"
              pending={pending}
              onConfirm={handleRemove}
              onCancel={() => setConfirming(false)}
            />
          )}
        </>
      )}
      {actionError && (
        <p className="library-controls__error" role="alert">
          {actionError}
        </p>
      )}
    </div>
  )
}
