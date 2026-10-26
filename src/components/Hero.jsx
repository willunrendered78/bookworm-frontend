import { Link } from 'react-router-dom'
import Barnaby from './Barnaby.jsx'
import './Hero.css'

// Compact banner above the home shelves. Barnaby is decorative; the h1 and tagline carry the meaning.
export default function Hero() {
  return (
    <div className="hero">
      <Barnaby size="md" />
      <div className="hero__text">
        <h1>BookWorm</h1>
        <p className="hero__tagline">Find your next read, keep a library, share what you think.</p>
        <Link to="/search" className="button-primary">
          Search books
        </Link>
      </div>
    </div>
  )
}
