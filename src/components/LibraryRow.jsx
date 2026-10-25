import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { dbMessage } from '../lib/dbMessages.js'
import BookCover from './BookCover.jsx'
import InlineConfirm from './InlineConfirm.jsx'
import { STATUSES } from './LibraryControls.jsx'
import './Library.css'

// One book in my library. summary is { id, title, authors, thumbnail } or undefined while it loads;
// failed means its details could not be loaded (the row still works).
export default function LibraryRow({ item, summary, failed, onRetry, onChangeStatus, onRemove }) {
  const [pending, setPending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')
  const busy = useRef(false)

  async function run(action) {
    if (busy.current) return false
    busy.current = true
    setPending(true)
    setMessage('')
    try {
      const { error } = await action()
      if (error) {
        setMessage(dbMessage(error.kind))
        return false
      }
      return true
    } catch {
      setMessage(dbMessage('unknown'))
      return false
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  const bookPath = `/books/${item.book_id}`
  const title = summary?.title || (failed ? 'Book details unavailable' : '')
  const author = summary?.authors?.[0] ?? ''

  return (
    <li className="library-row" aria-busy={!summary && !failed}>
      <div className="library-row__cover">
        {summary ? (
          <BookCover book={summary} />
        ) : failed ? (
          <BookCover book={{ id: item.book_id, title: 'Details unavailable', thumbnail: null }} />
        ) : (
          <span className="skeleton-card__cover" aria-hidden="true" />
        )}
      </div>
      <div className="library-row__main">
        {summary || failed ? (
          <Link to={bookPath} className="library-row__title">
            {title}
          </Link>
        ) : (
          <span className="skeleton-card__line" aria-hidden="true" />
        )}
        {author && <p className="library-row__author">{author}</p>}
        {failed && (
          <p className="library-row__author">
            We could not load this book&apos;s details.{' '}
            <button type="button" className="button-secondary" onClick={() => onRetry(item.book_id)}>
              Retry
            </button>
          </p>
        )}
        <div className="library-row__controls">
          <label className="library-controls__status">
            <span className="visually-hidden">Status for {title || 'this book'}</span>
            <select
              value={item.status}
              disabled={pending || confirming}
              onChange={(e) => run(() => onChangeStatus(item.book_id, e.target.value))}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          {!confirming && (
            <button type="button" className="button-secondary" onClick={() => setConfirming(true)} disabled={pending}>
              Remove
            </button>
          )}
        </div>
        {confirming && (
          <InlineConfirm
            message="Remove this book from your library? This also deletes any logs you wrote for it."
            confirmLabel="Remove"
            pending={pending}
            onConfirm={async () => {
              const ok = await run(() => onRemove(item.book_id))
              if (!ok) setConfirming(false)
            }}
            onCancel={() => setConfirming(false)}
          />
        )}
        {message && (
          <p className="library-row__error" role="alert">
            {message}
          </p>
        )}
      </div>
    </li>
  )
}
