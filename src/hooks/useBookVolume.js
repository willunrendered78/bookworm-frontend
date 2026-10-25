import { useCallback, useEffect, useState } from 'react'
import { callBooks } from '../data/db.js'
import { rememberBooks } from '../lib/bookCache.js'

// Loads one book from the google-books function. Returns { book, status, error, retry }.
// status: loading, ready, error (error is an error kind from callBooks). A stale answer is used silently.
// Leaving the page or changing id aborts the call, and a late answer is ignored.
export function useBookVolume(id) {
  const [state, setState] = useState({ book: null, status: 'loading', error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    setState({ book: null, status: 'loading', error: null })

    callBooks({ mode: 'volume', id, signal: controller.signal }).then(({ data, error }) => {
      if (!active) return
      if (error) {
        if (error.kind !== 'aborted') setState({ book: null, status: 'error', error: error.kind })
        return
      }
      if (!data?.item) {
        setState({ book: null, status: 'error', error: 'unknown' })
        return
      }
      rememberBooks([data.item])
      setState({ book: data.item, status: 'ready', error: null })
    })

    return () => {
      active = false
      controller.abort()
    }
  }, [id, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
