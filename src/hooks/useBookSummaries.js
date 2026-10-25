import { useCallback, useEffect, useRef, useState } from 'react'
import { callBooks } from '../data/db.js'
import { getCachedBooks, rememberBooks, toSummary } from '../lib/bookCache.js'

// Titles and covers for library books (the database only stores book ids).
// Books already seen are read from the local cache at once. The rest are fetched ONE AT A TIME, in order,
// through the function's volume mode (which has its own persistent cache), so a flaky upstream is never
// hit in parallel. A failed book is marked failed and does not stop the others; retry(id) tries it again.
// Returns { summaries: { [id]: summary }, failed: { [id]: true }, retry }.
export function useBookSummaries(ids) {
  const idsKey = ids.join(',')
  const [summaries, setSummaries] = useState(() => getCachedBooks(ids))
  const [failed, setFailed] = useState({})
  const [attempt, setAttempt] = useState(0)
  const failedRef = useRef(new Set())

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const wanted = idsKey ? idsKey.split(',') : []
    const cached = getCachedBooks(wanted)
    setSummaries((prev) => ({ ...cached, ...prev }))
    const missing = wanted.filter((id) => !cached[id] && !failedRef.current.has(id))

    ;(async () => {
      for (const id of missing) {
        if (!active) return
        const { data, error } = await callBooks({ mode: 'volume', id, signal: controller.signal })
        if (!active) return
        if (error || !data?.item) {
          if (error?.kind === 'aborted') return
          failedRef.current.add(id)
          setFailed((f) => ({ ...f, [id]: true }))
          continue
        }
        rememberBooks([data.item])
        setSummaries((prev) => ({ ...prev, [id]: toSummary(data.item) }))
      }
    })()

    return () => {
      active = false
      controller.abort()
    }
  }, [idsKey, attempt])

  const retry = useCallback((id) => {
    failedRef.current.delete(id)
    setFailed((f) => {
      const next = { ...f }
      delete next[id]
      return next
    })
    setAttempt((n) => n + 1)
  }, [])

  return { summaries, failed, retry }
}
