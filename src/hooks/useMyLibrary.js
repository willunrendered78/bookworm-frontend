import { useCallback, useEffect, useState } from 'react'
import { listLibrary, removeFromLibrary, setLibraryStatus } from '../data/db.js'

// My whole library (newest first). Returns { items, status, error, reload, changeStatus, remove }.
//   status: loading (first load), refreshing, ready, error.
//   changeStatus(bookId, status) and remove(bookId) resolve to { error } and update the list on success.
export function useMyLibrary() {
  const [state, setState] = useState({ items: [], status: 'loading', error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, status: s.items.length > 0 ? 'refreshing' : 'loading', error: null }))
    listLibrary().then(({ data, error }) => {
      if (!active) return
      if (error) setState((s) => ({ ...s, status: 'error', error: error.kind }))
      else setState({ items: data ?? [], status: 'ready', error: null })
    })
    return () => {
      active = false
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const changeStatus = useCallback(async (bookId, status) => {
    const { data, error } = await setLibraryStatus(bookId, status)
    if (!error) {
      setState((s) => ({ ...s, items: s.items.map((i) => (i.book_id === bookId ? { ...i, status: data.status } : i)) }))
    }
    return { error }
  }, [])

  const remove = useCallback(async (bookId) => {
    const { error } = await removeFromLibrary(bookId)
    if (!error) setState((s) => ({ ...s, items: s.items.filter((i) => i.book_id !== bookId) }))
    return { error }
  }, [])

  return { ...state, reload, changeStatus, remove }
}
