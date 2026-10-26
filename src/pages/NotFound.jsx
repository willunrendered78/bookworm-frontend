import { Link } from 'react-router-dom'
import Barnaby from '../components/Barnaby.jsx'
import '../components/Books.css'
import '../components/Library.css'

export default function NotFound() {
  return (
    <main className="page">
      <div className="library-empty">
        <Barnaby size="xl" />
        <h1>Page not found</h1>
        <p className="page__note">We could not find the page you were looking for.</p>
        <Link to="/" className="button-primary">
          Browse books
        </Link>
      </div>
    </main>
  )
}
