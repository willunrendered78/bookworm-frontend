import BookCard from './BookCard.jsx'

export default function BookGrid({ items, label }) {
  return (
    <ul className="book-grid" aria-label={label}>
      {items.map((book) => (
        <li key={book.id}>
          <BookCard book={book} />
        </li>
      ))}
    </ul>
  )
}
