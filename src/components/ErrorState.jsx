const MESSAGES = {
  network: 'We could not reach the server. Check your connection and try again.',
  rate_limited: 'Too many requests. Please wait a moment and try again.',
  upstream: 'The book service is busy right now. Please try again.',
  not_found: 'We could not find that.',
  bad_request: 'That request was not valid.',
  unknown: 'Something went wrong. Please try again.',
}

// Plain-language message for an error kind from callBooks, with a Retry button.
export default function ErrorState({ kind = 'unknown', onRetry, retryLabel = 'Retry' }) {
  return (
    <div className="error-state" role="alert">
      <p>{MESSAGES[kind] ?? MESSAGES.unknown}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}
