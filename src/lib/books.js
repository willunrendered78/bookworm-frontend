// Pure helpers for book lists. No Supabase import.

export const GENRES = [
  { slug: 'adventure', label: 'Adventure' },
  { slug: 'technology', label: 'Technology' },
  { slug: 'horror', label: 'Horror' },
  { slug: 'sci-fi', label: 'Sci-fi' },
  { slug: 'fiction', label: 'Fiction' },
  { slug: 'non-fiction', label: 'Non-fiction' },
]

export function isGenre(slug) {
  return GENRES.some((genre) => genre.slug === slug)
}

export function genreLabel(slug) {
  return GENRES.find((genre) => genre.slug === slug)?.label ?? slug
}

// Google sometimes returns http cover links; pages are served over https.
export function httpsUrl(url) {
  return typeof url === 'string' ? url.replace(/^http:\/\//i, 'https://') : null
}

export const COVER_VARIANTS = 6

// Same id always gives the same variant (0 to COVER_VARIANTS - 1); Books.css defines the gradients.
export function coverVariant(id) {
  let hash = 0
  for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash % COVER_VARIANTS
}

// Same limits as the edge function: trimmed, 1 to 100 characters.
export const QUERY_MAX = 100

export function validateQuery(input) {
  const value = String(input ?? '').trim()
  if (!value) return { ok: false, value, message: 'Type a title to search for.' }
  if (value.length > QUERY_MAX) {
    return { ok: false, value, message: `Search words can be at most ${QUERY_MAX} characters.` }
  }
  return { ok: true, value, message: '' }
}

// Appends a loaded page, dropping books already shown.
export function mergeItems(previous, next) {
  const seen = new Set(previous.map((item) => item.id))
  return [...previous, ...next.filter((item) => !seen.has(item.id))]
}
