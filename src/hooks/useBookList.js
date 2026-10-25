import { useCallback, useEffect, useRef, useState } from 'react'
import { callBooks } from '../data/db.js'
import { rememberBooks } from '../lib/bookCache.js'
import { mergeItems } from '../lib/books.js'

const LAST_PAGE = 49 // the function accepts pages 0 to 49

const EMPTY = { items: [], page: 0, hasMore: false, status: 'idle', error: null, stale: false }

// Loads a paged list from the google-books function.
//   params: { mode: 'genre', genre } | { mode: 'search', q } | { mode: 'home' }, or null to do nothing yet.
// Returns { items, hasMore, status, error, stale, loadMore, retry }.
//   status: idle (params null), loading (first page), loadingMore, ready, error.
//   error is an error kind from callBooks. An error with items present means loading more failed.
// Changing params, or unmounting, aborts the call in flight, and late answers are ignored.
export function useBookList(params) {
  const key = params ? JSON.stringify(params) : null
  const [state, setState] = useState(EMPTY)
  const paramsRef = useRef(null)
  const requestRef = useRef(0)
  const controllerRef = useRef(null)

  const run = useCallback(async (page, replace) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const requestId = ++requestRef.current

    setState((s) => ({ ...s, status: replace ? 'loading' : 'loadingMore', error: null }))
    const { data, error } = await callBooks({ ...paramsRef.current, page, signal: controller.signal })

    if (requestId !== requestRef.current) return // a newer request replaced this one
    if (error) {
      if (error.kind === 'aborted') return
      setState((s) => ({ ...s, status: 'error', error: error.kind }))
      return
    }
    const items = Array.isArray(data.items) ? data.items : []
    rememberBooks(items)
    const loadedPage = Number.isInteger(data.page) ? data.page : page
    setState((s) => ({
      items: replace ? items : mergeItems(s.items, items),
      page: loadedPage,
      // Follow hasMore, never the item count: a page can be short while hasMore is true.
      hasMore: Boolean(data.hasMore) && loadedPage < LAST_PAGE,
      status: 'ready',
      error: null,
      stale: Boolean(data.stale),
    }))
  }, [])

  useEffect(() => {
    if (!key) {
      setState(EMPTY)
      return undefined
    }
    paramsRef.current = JSON.parse(key)
    setState(EMPTY)
    run(0, true)
    return () => {
      requestRef.current += 1 // anything still in flight is now out of date
      controllerRef.current?.abort()
    }
  }, [key, run])

  const loadMore = useCallback(() => {
    if (state.hasMore && state.status === 'ready') run(state.page + 1, false)
  }, [run, state.hasMore, state.status, state.page])

  const retry = useCallback(() => {
    if (state.status !== 'error') return
    if (state.items.length === 0) run(0, true)
    else run(state.page + 1, false)
  }, [run, state.status, state.items.length, state.page])

  // Before the effect has started the first call, report loading instead of idle.
  const status = key && state.status === 'idle' ? 'loading' : state.status
  return { ...state, status, loadMore, retry }
}
