import { useParams } from 'react-router-dom'

export default function Genre() {
  const { genre } = useParams()
  return <main><h1>Genre: {genre} (placeholder)</h1></main>
}
