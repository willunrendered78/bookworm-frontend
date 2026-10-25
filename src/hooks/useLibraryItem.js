import { useCallback, useEffect, useRef, useState } from 'react'
import { addToLibrary, getLibraryItem, removeFromLibrary, setLibraryStatus } from '../data/db.js'
import { dbMessage } from '../lib/dbMessages.js'

// My library row for one book (private; only loads when signed in).
// Returns { item, status, error, pending, actionError, add, setStatus, remove, reload }.
//   status: idle (signed out), loading, ready (item is null when the book is not in my library), error.
//   add / setStatus / remove resolve to true when they worked. One action at a time; actionError holds a
//   fixed plain sentence for the last failure.
export function useLibraryItem(bookId, enabled) {
  const [state, setState] = useState({ item: null, status: enabled ? 'loading' : 'idle', error: null })
  const [version, setVersion] = useState(0)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState('')
  const busy = useRef(false)

  useEffect(() => {
    if (!enabled) {
      setState({ item: null, status: 'idle', error: null })
      return undefined
    }
    let active = true
    setState((s) => ({ ...s, status: 'loading', error: null }))
    getLibraryItem(bookId).then(({ data, error }) => {
      if (!active) return
      if (error) setState({ item: null, status: 'error', error: error.kind })
      else setState({ item: data ?? null, status: 'ready', error: null })
    })
    return () => {
      active = false
    }
  }, [bookId, enabled, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  const act = useCallback(async (call, onDone) => {
    if (busy.current) return false
    busy.current = true
    setPending(true)
    setActionError('')
    try {
      const { data, error } = await call()
      if (error) {
        setActionError(dbMessage(error.kind))
        // The screen disagrees with the database (another tab, an old page): load the real state.
        if (error.kind === 'already_in_library' || error.kind === 'not_in_library') setVersion((v) => v + 1)
        return false
      }
      onDone(data)
      return true
    } catch {
      setActionError(dbMessage('unknown'))
      return false
    } finally {
      busy.current = false
      setPending(false)
    }
  }, [])

  const add = useCallback(
    () => act(() => addToLibrary(bookId), (item) => setState({ item, status: 'ready', error: null })),
    [act, bookId],
  )
  const setStatus = useCallback(
    (status) => act(() => setLibraryStatus(bookId, status), (item) => setState({ item, status: 'ready', error: null })),
    [act, bookId],
  )
  const remove = useCallback(
    () => act(() => removeFromLibrary(bookId), () => setState({ item: null, status: 'ready', error: null })),
    [act, bookId],
  )

  return { ...state, pending, actionError, add, setStatus, remove, reload }
}
