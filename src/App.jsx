import { Route, Routes } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Genre from './pages/Genre.jsx'
import BookDetails from './pages/BookDetails.jsx'
import Library from './pages/Library.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import NotFound from './pages/NotFound.jsx'

// Only /library needs a signed-in user. Everything else stays public so deep links work when logged out.
export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/genre/:genre" element={<Genre />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route
          path="/library"
          element={
            <RequireAuth>
              <Library />
            </RequireAuth>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
