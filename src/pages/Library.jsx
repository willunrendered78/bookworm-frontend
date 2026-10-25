import { Link, useSearchParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState.jsx'
import LibraryRow from '../components/LibraryRow.jsx'
import { STATUSES } from '../components/LibraryControls.jsx'
import Skeleton from '../components/Skeleton.jsx'
import { useBookSummaries } from '../hooks/useBookSummaries.js'
import { useMyLibrary } from '../hooks/useMyLibrary.js'
import { dbMessage } from '../lib/dbMessages.js'
import '../components/Books.css'
import '../components/Library.css'

export default function Library() {
  const library = useMyLibrary()
  const { summaries, failed, retry } = useBookSummaries(library.items.map((i) => i.book_id))
  const [searchParams, setSearchParams] = useSearchParams()

  const requested = searchParams.get('status')
  const filter = STATUSES.some((s) => s.value === requested) ? requested : 'all'
  const visible = filter === 'all' ? library.items : library.items.filter((i) => i.status === filter)
  const count = (value) => library.items.filter((i) => i.status === value).length

  function chooseFilter(value) {
    setSearchParams(value === 'all' ? {} : { status: value }, { replace: true })
  }

  return (
    <main className="page">
      <h1>My Library</h1>

      {library.status === 'loading' && (
        <div aria-busy="true">
          <Skeleton grid count={6} />
        </div>
      )}

      {library.status === 'error' && library.items.length === 0 && (
        <div className="error-state" role="alert">
          <p>{dbMessage(library.error)}</p>
          <button type="button" onClick={library.reload}>
            Retry
          </button>
        </div>
      )}

      {library.status !== 'loading' && !(library.status === 'error' && library.items.length === 0) && (
        <>
          {library.items.length === 0 ? (
            <div className="library-empty">
              <p className="page__note">Your library is empty. Add books from their pages to keep track of them here.</p>
              <Link to="/">Browse books</Link>
            </div>
          ) : (
            <>
              <div className="library-filters" role="group" aria-label="Filter by status">
                <button type="button" aria-pressed={filter === 'all'} onClick={() => chooseFilter('all')}>
                  All ({library.items.length})
                </button>
                {STATUSES.map((s) => (
                  <button
                    type="button"
                    key={s.value}
                    aria-pressed={filter === s.value}
                    onClick={() => chooseFilter(s.value)}
                  >
                    {s.label} ({count(s.value)})
                  </button>
                ))}
              </div>
              {visible.length === 0 ? (
                <p className="page__note">No books with this status.</p>
              ) : (
                <ul className="library-list">
                  {visible.map((item) => (
                    <LibraryRow
                      key={item.id}
                      item={item}
                      summary={summaries[item.book_id]}
                      failed={Boolean(failed[item.book_id])}
                      onRetry={retry}
                      onChangeStatus={library.changeStatus}
                      onRemove={library.remove}
                    />
                  ))}
                </ul>
              )}
              {library.status === 'error' && (
                <ErrorState kind={library.error === 'network' ? 'network' : 'unknown'} onRetry={library.reload} />
              )}
            </>
          )}
        </>
      )}
    </main>
  )
}
