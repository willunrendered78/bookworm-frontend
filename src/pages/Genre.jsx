import { useParams } from 'react-router-dom'
import BookResults from '../components/BookResults.jsx'
import { useBookList } from '../hooks/useBookList.js'
import { genreLabel, isGenre } from '../lib/books.js'
import NotFound from './NotFound.jsx'

export default function Genre() {
  const { genre } = useParams()
  if (!isGenre(genre)) return <NotFound />
  return <GenreBooks key={genre} genre={genre} />
}

function GenreBooks({ genre }) {
  const list = useBookList({ mode: 'genre', genre })
  const label = genreLabel(genre)
  return (
    <main className="page">
      <h1>{label}</h1>
      <BookResults list={list} label={`${label} books`} emptyMessage="No books found here yet." />
    </main>
  )
}
