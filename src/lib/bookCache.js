// Small summaries of books I have seen (id, title, authors, cover), kept in localStorage so the
// library page can show titles and covers without calling Google again. Best effort: every access
// is in try/catch and a missing, full or corrupt store only means a cache miss.

const KEY = 'bookworm:books:v1'
const VERSION = 1
const MAX_ENTRIES = 300
const MAX_BYTES = 200_000

export function toSummary(book) {
  return {
    id: String(book.id),
    title: typeof book.title === 'string' ? book.title : '',
    authors: Array.isArray(book.authors) ? book.authors.filter((a) => typeof a === 'string').slice(0, 3) : [],
    thumbnail: typeof book.thumbnail === 'string' ? book.thumbnail : null,
  }
}

function readEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY))
    if (!parsed || parsed.v !== VERSION || !Array.isArray(parsed.books)) return []
    return parsed.books.filter((b) => b && typeof b.id === 'string' && b.id)
  } catch {
    return []
  }
}

// { [id]: summary } for the ids that are stored.
export function getCachedBooks(ids) {
  const wanted = new Set(ids)
  const found = {}
  for (const entry of readEntries()) if (wanted.has(entry.id)) found[entry.id] = toSummary(entry)
  return found
}

// Newest at the end; the oldest entries are dropped past the caps.
export function rememberBooks(books) {
  if (!Array.isArray(books) || books.length === 0) return
  try {
    const fresh = books.filter((b) => b && b.id).map(toSummary)
    const freshIds = new Set(fresh.map((b) => b.id))
    let entries = [...readEntries().filter((b) => !freshIds.has(b.id)), ...fresh].slice(-MAX_ENTRIES)
    let text = JSON.stringify({ v: VERSION, books: entries })
    while (text.length > MAX_BYTES && entries.length > 1) {
      entries = entries.slice(Math.ceil(entries.length / 4))
      text = JSON.stringify({ v: VERSION, books: entries })
    }
    localStorage.setItem(KEY, text)
  } catch {
    // storage unavailable or full: skip
  }
}
