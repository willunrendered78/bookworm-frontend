import { useId } from 'react'
import { Link } from 'react-router-dom'
import BookCard from './BookCard.jsx'
import ErrorState from './ErrorState.jsx'
import Skeleton from './Skeleton.jsx'

// One horizontal row of books. Shows the books it has (even saved ones) and only falls back to
// skeletons or an error when it has none.
export default function Shelf({ title, seeAllTo, items = [], loading = false, errorKind = null, onRetry, note }) {
  const headingId = useId()
  const hasItems = items.length > 0

  return (
    <section className="shelf" aria-labelledby={headingId} aria-busy={loading}>
      <div className="shelf__header">
        <h2 id={headingId}>{title}</h2>
        {seeAllTo && (
          <Link to={seeAllTo}>
            See all<span className="visually-hidden"> {title} books</span>
          </Link>
        )}
      </div>
      {note && <p className="shelf__note">{note}</p>}
      {hasItems ? (
        <ul className="shelf__row" tabIndex={0} aria-label={`${title} books`}>
          {items.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      ) : loading ? (
        <Skeleton as="div" count={8} />
      ) : !errorKind ? (
        <p className="shelf__note">No books found on this shelf right now.</p>
      ) : null}
      {errorKind && <ErrorState kind={errorKind} onRetry={onRetry} />}
    </section>
  )
}
