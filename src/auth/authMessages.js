// Plain-language text for auth failures. The raw Supabase error is never shown to the user.

export const GENERIC_ERROR = 'Something went wrong. Please try again.'

const NETWORK = 'We could not reach the server. Check your connection and try again.'
const RATE_LIMIT = 'Too many attempts. Please wait a minute and try again.'

function isNetworkError(error) {
  return (
    error?.name === 'AuthRetryableFetchError' ||
    error?.status === 0 ||
    (typeof navigator !== 'undefined' && navigator.onLine === false)
  )
}

function isRateLimit(error) {
  return error?.status === 429 || String(error?.code ?? '').startsWith('over_')
}

export function signInMessage(error) {
  if (isNetworkError(error)) return NETWORK
  if (isRateLimit(error)) return RATE_LIMIT
  // Same text for a wrong password and an unknown email, so accounts cannot be probed.
  if (error?.code === 'invalid_credentials') return 'That email and password do not match.'
  return GENERIC_ERROR
}

export function signUpMessage(error) {
  if (isNetworkError(error)) return NETWORK
  if (isRateLimit(error)) return RATE_LIMIT
  switch (error?.code) {
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with that email already exists. Try logging in instead.'
    case 'weak_password':
      return 'That password is too weak. Use at least 8 characters.'
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Please enter a valid email address.'
    case 'signup_disabled':
      return 'Sign up is not available right now.'
    default:
      return GENERIC_ERROR
  }
}
