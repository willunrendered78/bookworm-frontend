import BookGrid from './BookGrid.jsx'
import ErrorState from './ErrorState.jsx'
import Skeleton from './Skeleton.jsx'
import './Books.css'

// Grid plus loading, empty, error and Load more states for a useBookList result.
export default function BookResults({ list, label, emptyMessage }) {
  const { items, hasMore, status, error, stale, loadMore, retry } = list
  const empty = items.length === 0

  if (empty && status === 'error') return <ErrorState kind={error} onRetry={retry} />
  if (empty && status === 'loading') {
    return (
      <div aria-busy="true">
        <Skeleton grid count={12} />
      </div>
    )
  }
  if (empty && !hasMore) return <p className="page__note">{emptyMessage}</p>

  return (
    <div aria-busy={status === 'loadingMore'}>
      {stale && <p className="page__note">Showing saved results.</p>}
      {empty ? (
        <p className="page__note">No matches on this page yet. More results may follow.</p>
      ) : (
        <BookGrid items={items} label={label} />
      )}
      {status === 'error' && <ErrorState kind={error} onRetry={retry} />}
      {hasMore && status !== 'error' && (
        <div className="page__more">
          <button type="button" className="button-secondary" onClick={loadMore} disabled={status === 'loadingMore'}>
            {status === 'loadingMore' ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
