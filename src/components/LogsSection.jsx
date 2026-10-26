import { useRef, useState } from 'react'
import { useAuth } from '../auth/AuthProvider.jsx'
import { deleteLog } from '../data/db.js'
import { dbMessage } from '../lib/dbMessages.js'
import { formatDate } from '../lib/text.js'
import ErrorState from './ErrorState.jsx'
import InlineConfirm from './InlineConfirm.jsx'
import LogForm from './LogForm.jsx'
import LogList from './LogList.jsx'
import './InlineConfirm.css'
import './Logs.css'

// Reader logs for a book: public list, plus a form and edit/delete for my own logs while the book is
// in my library. library comes from useLibraryItem.
export default function LogsSection({ bookId, logsState, library }) {
  const { user, loading } = useAuth()
  const { logs, status, error, refetch } = logsState
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const busy = useRef(false)

  // true / false once known, null while loading or if the library check failed.
  const inLibrary = user && library.status === 'ready' ? Boolean(library.item) : null

  async function handleDelete(id) {
    if (busy.current) return
    busy.current = true
    setPending(true)
    setMessage('')
    try {
      const { error: dbError } = await deleteLog(id)
      if (dbError) {
        setMessage(dbMessage(dbError.kind))
      } else {
        setDeletingId(null)
        refetch()
      }
    } catch {
      setMessage(dbMessage('unknown'))
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  function renderEditor(log) {
    return (
      <LogForm
        bookId={bookId}
        log={log}
        onSaved={() => {
          setEditingId(null)
          refetch()
        }}
        onCancel={() => setEditingId(null)}
      />
    )
  }

  function renderActions(log) {
    if (deletingId === log.id) {
      return (
        <InlineConfirm
          message="Delete this log? This cannot be undone."
          confirmLabel="Delete"
          pending={pending}
          onConfirm={() => handleDelete(log.id)}
          onCancel={() => setDeletingId(null)}
        />
      )
    }
    const when = formatDate(log.created_at)
    return (
      <div className="log-actions">
        <button
          type="button"
          className="button-quiet"
          onClick={() => {
            setDeletingId(null)
            setMessage('')
            setEditingId(log.id)
          }}
          aria-label={`Edit your log from ${when}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="button-quiet"
          onClick={() => {
            setEditingId(null)
            setMessage('')
            setDeletingId(log.id)
          }}
          aria-label={`Delete your log from ${when}`}
        >
          Delete
        </button>
      </div>
    )
  }

  return (
    <section className="logs" aria-labelledby="logs-heading" aria-busy={status === 'loading' || status === 'refreshing'}>
      <h2 id="logs-heading">Reader logs</h2>

      {user && inLibrary === true && <LogForm bookId={bookId} onSaved={refetch} />}
      {user && inLibrary === false && (
        <p className="logs__hint">
          Add this book to your library to write a log.
          <button type="button" onClick={library.add} disabled={library.pending}>
            {library.pending ? 'Adding…' : 'Add to library'}
          </button>
        </p>
      )}
      {!loading && !user && <p className="logs__hint">Sign in and add this book to your library to write a log.</p>}
      {message && (
        <p className="logs__message" role="alert">
          {message}
        </p>
      )}

      {status === 'loading' && (
        <div className="log-skeleton" aria-hidden="true">
          <span className="skeleton-card__line" />
          <span className="skeleton-card__line skeleton-card__line--short" />
        </div>
      )}
      {status === 'error' && logs.length === 0 && (
        <ErrorState kind={error === 'network' ? 'network' : 'unknown'} onRetry={refetch} />
      )}
      {status !== 'loading' && status !== 'error' && logs.length === 0 && (
        <p className="page__note">No logs yet.{user && inLibrary ? ' Write the first one above.' : ''}</p>
      )}
      {logs.length > 0 && (
        <LogList
          logs={logs}
          currentUserId={user?.id}
          editingId={editingId}
          renderEditor={renderEditor}
          renderActions={renderActions}
        />
      )}
      {status === 'error' && logs.length > 0 && (
        <ErrorState kind={error === 'network' ? 'network' : 'unknown'} onRetry={refetch} retryLabel="Reload logs" />
      )}
    </section>
  )
}
