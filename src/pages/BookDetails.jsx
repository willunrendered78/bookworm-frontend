import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import BookCover from '../components/BookCover.jsx'
import ErrorState from '../components/ErrorState.jsx'
import LibraryControls from '../components/LibraryControls.jsx'
import LogsSection from '../components/LogsSection.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useBookLogs } from '../hooks/useBookLogs.js'
import { useBookVolume } from '../hooks/useBookVolume.js'
import { useLibraryItem } from '../hooks/useLibraryItem.js'
import { plainText, publishedYear } from '../lib/text.js'
import NotFound from './NotFound.jsx'
import '../components/Details.css'

// Same pattern the function enforces; a bad id never makes a call.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/

export default function BookDetails() {
  const { id } = useParams()
  if (!ID_PATTERN.test(id ?? '')) return <NotFound />
  return <BookPage key={id} id={id} />
}

function BackLink() {
  const navigate = useNavigate()
  const location = useLocation()
  // A direct visit (deep link, refresh in a new tab) has no history to go back to.
  if (location.key === 'default') {
    return (
      <Link to="/" className="back-link">
        ← Back to browse
      </Link>
    )
  }
  return (
    <button type="button" className="back-link" onClick={() => navigate(-1)}>
      ← Back
    </button>
  )
}

function BookPage({ id }) {
  const { user } = useAuth()
  const volume = useBookVolume(id)
  const logsState = useBookLogs(id)
  const library = useLibraryItem(id, Boolean(user))
  const myLogCount = user ? logsState.logs.filter((log) => log.user_id === user.id).length : 0

  if (volume.status === 'error' && volume.error === 'not_found') {
    return (
      <main className="page">
        <BackLink />
        <h1>Book not found</h1>
        <p className="page__note">We could not find that book.</p>
      </main>
    )
  }

  return (
    <main className="page book-page">
      <BackLink />
      <BookHeader volume={volume} />
      <LibraryControls library={library} logCount={myLogCount} onRemoved={logsState.refetch} />
      <LogsSection bookId={id} logsState={logsState} library={library} />
    </main>
  )
}

function BookHeader({ volume }) {
  const { book, status, error, retry } = volume
  const description = useMemo(() => plainText(book?.description), [book])

  if (status === 'loading') {
    return (
      <div className="book-details__skeleton" aria-busy="true" aria-label="Loading book">
        <span className="skeleton-card__cover" aria-hidden="true" />
        <span className="skeleton-card__line" aria-hidden="true" />
        <span className="skeleton-card__line skeleton-card__line--short" aria-hidden="true" />
      </div>
    )
  }
  if (status === 'error') return <ErrorState kind={error} onRetry={retry} />

  const authors = Array.isArray(book.authors) ? book.authors : []
  const categories = Array.isArray(book.categories) ? book.categories : []
  const year = publishedYear(book.publishedDate)

  return (
    <article className="book-details">
      <div className="book-details__cover">
        <BookCover book={book} />
      </div>
      <div className="book-details__main">
        <h1>{book.title || 'Untitled'}</h1>
        <p className="book-details__authors">{authors.length > 0 ? authors.join(', ') : 'Unknown author'}</p>
        {(year || book.pageCount) && (
          <dl className="book-details__facts">
            {year && (
              <div>
                <dt>Published</dt>
                <dd>{year}</dd>
              </div>
            )}
            {book.pageCount > 0 && (
              <div>
                <dt>Pages</dt>
                <dd>{book.pageCount}</dd>
              </div>
            )}
          </dl>
        )}
        {categories.length > 0 && (
          <ul className="book-details__tags" aria-label="Categories">
            {categories.map((category) => (
              <li key={category}>{category}</li>
            ))}
          </ul>
        )}
        {description ? (
          <p className="book-details__description">{description}</p>
        ) : (
          <p className="page__note">No description available.</p>
        )}
      </div>
    </article>
  )
}
