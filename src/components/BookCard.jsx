import { Link } from 'react-router-dom'
import BookCover from './BookCover.jsx'

export default function BookCard({ book }) {
  const author = Array.isArray(book.authors) && book.authors.length > 0 ? book.authors[0] : 'Unknown author'
  const title = book.title || 'Untitled'

  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <BookCover book={book} />
      <span className="book-card__title">{title}</span>
      <span className="book-card__author">{author}</span>
    </Link>
  )
}
