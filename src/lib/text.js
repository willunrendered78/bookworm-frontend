// Text helpers for book and log display.

// Google descriptions can contain HTML. Turn it into plain text: line breaks become newlines and
// every tag is dropped. DOMParser builds an inert document (no scripts run, nothing is loaded).
export function plainText(input) {
  if (typeof input !== 'string' || !input) return ''
  const withBreaks = input
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, '\n\n')
  const doc = new DOMParser().parseFromString(withBreaks, 'text/html')
  return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
}

export function publishedYear(date) {
  const match = /^\d{4}/.exec(String(date ?? ''))
  return match ? match[0] : ''
}

export function formatDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  try {
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return date.toISOString().slice(0, 10)
  }
}
