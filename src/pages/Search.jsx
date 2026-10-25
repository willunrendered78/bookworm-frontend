import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BookResults from '../components/BookResults.jsx'
import { useBookList } from '../hooks/useBookList.js'
import { validateQuery } from '../lib/books.js'
import '../components/AuthForm.css'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const checked = urlQuery ? validateQuery(urlQuery) : null
  const activeQuery = checked?.ok ? checked.value : null
  const list = useBookList(activeQuery ? { mode: 'search', q: activeQuery } : null)

  return (
    <main className="page">
      <h1>Search</h1>
      {/* key: the form restarts from the URL when it changes (back button, refresh). */}
      <SearchForm
        key={urlQuery}
        initial={urlQuery}
        urlMessage={checked && !checked.ok ? checked.message : ''}
        onSearch={(value) => setSearchParams({ q: value })}
      />
      <div className="search-results">
        <p className="visually-hidden" role="status">
          {activeQuery && list.status === 'loading' ? 'Searching…' : ''}
        </p>
        {!urlQuery && <p className="page__note">Search for a book by title.</p>}
        {activeQuery && (
          <BookResults
            list={list}
            label={`Results for ${activeQuery}`}
            emptyMessage={`No books found for "${activeQuery}". Try different words.`}
          />
        )}
      </div>
    </main>
  )
}

function SearchForm({ initial, urlMessage, onSearch }) {
  const [text, setText] = useState(initial)
  const [message, setMessage] = useState(urlMessage)

  function handleSubmit(event) {
    event.preventDefault()
    const checked = validateQuery(text)
    if (!checked.ok) {
      setMessage(checked.message)
      return
    }
    setMessage('')
    onSearch(checked.value)
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <label htmlFor="search-q" className="visually-hidden">
        Book title
      </label>
      <input
        id="search-q"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Search by title"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-invalid={message ? 'true' : undefined}
        aria-describedby={message ? 'search-message' : undefined}
      />
      <button type="submit">Search</button>
      {message && (
        <p className="auth-form__error search-form__message" id="search-message" role="alert">
          {message}
        </p>
      )}
    </form>
  )
}
