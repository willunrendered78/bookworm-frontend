import { useState } from 'react'
import { coverVariant, httpsUrl } from '../lib/books.js'

// Cover image in a fixed-ratio box; falls back to a deterministic gradient with the title on it.
export default function BookCover({ book }) {
  const [broken, setBroken] = useState(false)
  const src = httpsUrl(book.thumbnail)
  const title = book.title || 'Untitled'

  return (
    <span className="book-cover">
      {src && !broken ? (
        <img src={src} alt={`Cover of ${title}`} loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <span className={`book-cover__fallback book-cover__fallback--${coverVariant(book.id)}`} aria-hidden="true">
          {title}
        </span>
      )}
    </span>
  )
}
