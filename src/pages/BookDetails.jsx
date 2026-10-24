import { useParams } from 'react-router-dom'

export default function BookDetails() {
  const { id } = useParams()
  return <main><h1>Book {id} (placeholder)</h1></main>
}
