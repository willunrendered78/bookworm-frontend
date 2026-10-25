// Last good shelves, kept in localStorage so the home page can paint before the network answers.
// Everything is best effort: storage can be missing, full, blocked or hold junk, and none of that may break the page.
import { isGenre } from './books.js'

const KEY = 'bookworm:shelves:v1'
const VERSION = 1
const MAX_ITEMS = 20
const MAX_BYTES = 200_000

function slim(book) {
  return {
    id: String(book.id),
    title: typeof book.title === 'string' ? book.title : '',
    authors: Array.isArray(book.authors) ? book.authors.filter((a) => typeof a === 'string').slice(0, 3) : [],
    thumbnail: typeof book.thumbnail === 'string' ? book.thumbnail : null,
  }
}

function readAll() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY))
    if (!parsed || parsed.v !== VERSION || typeof parsed.shelves !== 'object' || !parsed.shelves) return {}
    const shelves = {}
    for (const [slug, items] of Object.entries(parsed.shelves)) {
      if (!isGenre(slug) || !Array.isArray(items)) continue
      shelves[slug] = items.filter((b) => b && typeof b.id === 'string' && b.id).map(slim).slice(0, MAX_ITEMS)
    }
    return shelves
  } catch {
    return {}
  }
}

// { [genre slug]: books[] }, empty when nothing usable is stored.
export function loadShelves() {
  return readAll()
}

export function saveShelf(slug, books) {
  if (!isGenre(slug) || !Array.isArray(books) || books.length === 0) return
  try {
    const shelves = readAll()
    shelves[slug] = books.filter((b) => b && b.id).map(slim).slice(0, MAX_ITEMS)
    const text = JSON.stringify({ v: VERSION, shelves })
    if (text.length > MAX_BYTES) return
    localStorage.setItem(KEY, text)
  } catch {
    // storage unavailable or full: skip saving
  }
}
