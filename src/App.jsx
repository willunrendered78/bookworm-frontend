import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Genre from './pages/Genre.jsx'
import BookDetails from './pages/BookDetails.jsx'
import Library from './pages/Library.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import NotFound from './pages/NotFound.jsx'

// RequireAuth will wrap only /library (added in the auth step).
export default function App() {
  return (
    <>
      <nav>
        <Link to="/">BookWorm</Link> <Link to="/search">Search</Link>{' '}
        <Link to="/library">My Library</Link> <Link to="/login">Log in</Link>{' '}
        <Link to="/signup">Sign up</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/genre/:genre" element={<Genre />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/library" element={<Library />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
