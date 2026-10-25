// Plain-language text for library and log failures. The raw database error is never shown.

const MESSAGES = {
  not_in_library: 'Add this book to your library first.',
  invalid: 'Please check your entry. A log needs 1 to 5000 characters and a rating from 1 to 5.',
  already_in_library: 'This book is already in your library.',
  permission: 'You are not allowed to do that.',
  session_expired: 'Your session ended. Please sign in again.',
  network: 'We could not reach the server. Check your connection and try again.',
  unknown: 'Something went wrong. Please try again.',
}

export function dbMessage(kind) {
  return MESSAGES[kind] ?? MESSAGES.unknown
}
