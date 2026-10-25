// The only module that talks to Supabase (tables and edge functions).
// Auth functions only for now; browsing, library and log functions are added in later steps.
import { supabase } from '../lib/supabase.js'

const NOT_CONFIGURED = { message: 'not_configured', code: 'not_configured' }

// Every function resolves to { data, error } and never throws.
// error is the raw Supabase error (or NOT_CONFIGURED). The UI maps it to plain text and never shows it.

export async function signUp({ email, password, displayName }) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED }
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim() } },
  })
}

export async function signIn({ email, password }) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED }
  return supabase.auth.signInWithPassword({ email: email.trim(), password })
}

export async function signOut() {
  if (!supabase) return { error: NOT_CONFIGURED }
  return supabase.auth.signOut()
}

export async function getSession() {
  if (!supabase) return { data: { session: null }, error: NOT_CONFIGURED }
  return supabase.auth.getSession()
}

// callback(event, session). Returns an unsubscribe function.
export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}

// Public profile read (profiles is publicly selectable). Returns { data: { display_name } | null, error }.
export async function getProfile(userId) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED }
  return supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle()
}

// Books come only from the google-books edge function; the browser never calls Google.
// Resolves to { data, error } and never throws. error is { kind } where kind is one of
// network, rate_limited, upstream, not_found, bad_request, unknown, or aborted (the caller cancelled).
// data is the function's JSON: { items, page, hasMore, totalItems, stale? } or { item, stale? }.
export async function callBooks({ mode, q, genre, page, id, signal }) {
  if (!supabase) return { data: null, error: { kind: 'unknown' } }
  const body = { mode }
  if (q !== undefined) body.q = q
  if (genre !== undefined) body.genre = genre
  if (page !== undefined) body.page = page
  if (id !== undefined) body.id = id
  try {
    const { data, error } = await supabase.functions.invoke('google-books', { body, signal })
    if (error) return { data: null, error: { kind: await booksErrorKind(error, signal) } }
    if (!data || typeof data !== 'object') return { data: null, error: { kind: 'unknown' } }
    return { data, error: null }
  } catch (caught) {
    return { data: null, error: { kind: await booksErrorKind(caught, signal) } }
  }
}

const CODE_KINDS = {
  rate_limited: 'rate_limited',
  upstream_error: 'upstream',
  upstream_timeout: 'upstream',
  not_found: 'not_found',
  invalid_request: 'bad_request',
  method_not_allowed: 'bad_request',
  internal_error: 'unknown',
}

const STATUS_KINDS = { 400: 'bad_request', 404: 'not_found', 429: 'rate_limited', 502: 'upstream', 504: 'upstream' }

async function booksErrorKind(error, signal) {
  if (signal?.aborted || error?.name === 'AbortError' || error?.context?.name === 'AbortError') return 'aborted'
  if (error?.name === 'FunctionsFetchError') return 'network'
  if (error?.name === 'FunctionsRelayError') return 'upstream'
  if (error?.name === 'FunctionsHttpError') {
    try {
      const body = await error.context.json()
      const kind = CODE_KINDS[body?.error?.code]
      if (kind) return kind
    } catch {
      // unreadable body: fall back to the status below
    }
    return STATUS_KINDS[error.context?.status] ?? 'unknown'
  }
  return 'unknown'
}

// ---- Library and logs ----
// Signed-in session only; row level security decides what each user can read or change.
// Every function resolves to { data, error } with error = { kind } and never throws. Kinds:
// not_in_library, invalid, already_in_library, permission, session_expired, network, unknown.

const DB_CODE_KINDS = {
  23503: 'not_in_library', // a log needs the same user's library row
  23514: 'invalid', // body length, rating range or status check
  22001: 'invalid',
  23505: 'already_in_library',
  42501: 'permission',
  PGRST301: 'session_expired',
  PGRST303: 'session_expired',
}

function dbErrorKind(error, status) {
  if (status === 401) return 'session_expired'
  const kind = DB_CODE_KINDS[String(error.code ?? '')]
  if (kind) return kind
  if (status === 0 || /failed to fetch|network|load failed/i.test(String(error.message ?? ''))) return 'network'
  if (status === 403) return 'permission'
  return 'unknown'
}

// build(supabase) returns a query. emptyKind: error kind to report when an update/delete matched no row
// (row level security hides other people's rows silently instead of raising an error).
async function dbCall(build, emptyKind) {
  if (!supabase) return { data: null, error: { kind: 'unknown' } }
  try {
    const { data, error, status } = await build(supabase)
    if (error) return { data: null, error: { kind: dbErrorKind(error, status) } }
    if (emptyKind && Array.isArray(data) && data.length === 0) return { data: null, error: { kind: emptyKind } }
    return { data, error: null }
  } catch {
    return { data: null, error: { kind: 'unknown' } }
  }
}

const LIBRARY_COLUMNS = 'id, book_id, status, created_at'

// Public. Newest first, with each author's display_name (logs.user_id references profiles).
export function getBookLogs(bookId) {
  return dbCall((s) =>
    s
      .from('logs')
      .select('id, user_id, body, rating, created_at, updated_at, profiles(display_name)')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
      .limit(100),
  )
}

// My library row for this book, or data: null when it is not in my library.
export function getLibraryItem(bookId) {
  return dbCall((s) => s.from('library_items').select(LIBRARY_COLUMNS).eq('book_id', bookId).maybeSingle())
}

export function listLibrary() {
  return dbCall((s) => s.from('library_items').select(LIBRARY_COLUMNS).order('created_at', { ascending: false }))
}

// user_id and status come from the column defaults (auth.uid() and want_to_read).
export function addToLibrary(bookId) {
  return dbCall((s) => s.from('library_items').insert({ book_id: bookId }).select(LIBRARY_COLUMNS).single())
}

export async function setLibraryStatus(bookId, status) {
  const { data, error } = await dbCall(
    (s) => s.from('library_items').update({ status }).eq('book_id', bookId).select(LIBRARY_COLUMNS),
    'not_in_library',
  )
  return { data: data?.[0] ?? null, error }
}

// Also deletes my logs for the book (cascade in the database).
export function removeFromLibrary(bookId) {
  return dbCall((s) => s.from('library_items').delete().eq('book_id', bookId).select('id'))
}

export function addLog({ bookId, body, rating }) {
  return dbCall((s) =>
    s
      .from('logs')
      .insert({ book_id: bookId, body: body.trim(), rating: rating ?? null })
      .select('id')
      .single(),
  )
}

export function updateLog(id, { body, rating }) {
  return dbCall(
    (s) =>
      s
        .from('logs')
        .update({ body: body.trim(), rating: rating ?? null })
        .eq('id', id)
        .select('id'),
    'permission',
  )
}

export function deleteLog(id) {
  return dbCall((s) => s.from('logs').delete().eq('id', id).select('id'), 'permission')
}
