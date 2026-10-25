import { useCallback, useEffect, useState } from 'react'
import Shelf from '../components/Shelf.jsx'
import { useBookList } from '../hooks/useBookList.js'
import { genreLabel } from '../lib/books.js'
import { loadShelves, saveShelf } from '../lib/shelfCache.js'

// Home and the technology genre send the same query, so the home call is the Technology shelf.
// Shelves load one at a time, in this order, to be gentle on the upstream.
const SHELVES = [
  { slug: 'technology', params: { mode: 'home' } },
  { slug: 'adventure', params: { mode: 'genre', genre: 'adventure' } },
  { slug: 'horror', params: { mode: 'genre', genre: 'horror' } },
  { slug: 'sci-fi', params: { mode: 'genre', genre: 'sci-fi' } },
  { slug: 'fiction', params: { mode: 'genre', genre: 'fiction' } },
  { slug: 'non-fiction', params: { mode: 'genre', genre: 'non-fiction' } },
]

export default function Home() {
  const [saved] = useState(loadShelves)
  const [settledCount, setSettledCount] = useState(0)
  // Shelf i starts once shelf i - 1 has finished, whether it worked or not.
  const handleSettled = useCallback((index) => setSettledCount((n) => Math.max(n, index + 1)), [])

  return (
    <main>
      <h1 className="visually-hidden">Browse books</h1>
      {SHELVES.map((shelf, index) => (
        <HomeShelf
          key={shelf.slug}
          shelf={shelf}
          index={index}
          enabled={settledCount >= index}
          saved={saved[shelf.slug] ?? []}
          onSettled={handleSettled}
        />
      ))}
    </main>
  )
}

function HomeShelf({ shelf, index, enabled, saved, onSettled }) {
  const list = useBookList(enabled ? shelf.params : null)
  const settled = list.status === 'ready' || list.status === 'error'

  useEffect(() => {
    if (settled) onSettled(index)
  }, [settled, index, onSettled])

  useEffect(() => {
    if (list.status === 'ready' && list.items.length > 0) saveShelf(shelf.slug, list.items)
  }, [list.status, list.items, shelf.slug])

  const showingSaved = list.items.length === 0 && saved.length > 0
  let note = ''
  if (list.stale) note = 'Showing saved results.'
  else if (showingSaved && list.status === 'error') note = 'Could not refresh. Showing saved books.'
  else if (showingSaved && !settled) note = 'Showing saved books while new ones load.'

  return (
    <Shelf
      title={genreLabel(shelf.slug)}
      seeAllTo={`/genre/${shelf.slug}`}
      items={list.items.length > 0 ? list.items : saved}
      loading={!settled}
      errorKind={list.status === 'error' ? list.error : null}
      onRetry={list.retry}
      note={note}
    />
  )
}
