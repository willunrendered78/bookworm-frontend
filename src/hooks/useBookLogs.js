import { useCallback, useEffect, useState } from 'react'
import { getBookLogs } from '../data/db.js'

// Public logs for one book, newest first, with each author's display_name (logs.profiles).
// Returns { logs, status, error, refetch }.
//   status: loading (first load), refreshing (reloading, old logs kept), ready, error.
// A reply that arrives after the book changed or the page closed is ignored.
export function useBookLogs(bookId) {
  const [state, setState] = useState({ logs: [], status: 'loading', error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, status: s.logs.length > 0 ? 'refreshing' : 'loading', error: null }))
    getBookLogs(bookId).then(({ data, error }) => {
      if (!active) return
      if (error) setState((s) => ({ ...s, status: 'error', error: error.kind }))
      else setState({ logs: data ?? [], status: 'ready', error: null })
    })
    return () => {
      active = false
    }
  }, [bookId, version])

  const refetch = useCallback(() => setVersion((v) => v + 1), [])
  return { ...state, refetch }
}
