import { useId, useRef, useState } from 'react'
import { addLog, updateLog } from '../data/db.js'
import { dbMessage } from '../lib/dbMessages.js'
import StarRating from './StarRating.jsx'

const BODY_MAX = 5000 // same limit as the logs_body_length check

// Create a log (no log prop) or edit one of mine (log prop). onSaved runs after a successful write.
export default function LogForm({ bookId, log, onSaved, onCancel }) {
  const editing = Boolean(log)
  const fieldId = useId()
  const [body, setBody] = useState(log?.body ?? '')
  const [rating, setRating] = useState(Number.isInteger(log?.rating) ? log.rating : null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const submitting = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting.current) return
    const trimmed = body.trim()
    if (!trimmed) {
      setError('Write something before saving.')
      return
    }
    if (trimmed.length > BODY_MAX) {
      setError(`A log can be at most ${BODY_MAX} characters.`)
      return
    }
    submitting.current = true
    setPending(true)
    setError('')
    try {
      const { error: dbError } = editing
        ? await updateLog(log.id, { body: trimmed, rating })
        : await addLog({ bookId, body: trimmed, rating })
      if (dbError) {
        setError(dbMessage(dbError.kind))
        return
      }
      if (!editing) {
        setBody('')
        setRating(null)
      }
      await onSaved?.()
    } catch {
      setError(dbMessage('unknown'))
    } finally {
      submitting.current = false
      setPending(false)
    }
  }

  return (
    <form className="log-form" onSubmit={handleSubmit}>
      <label htmlFor={fieldId}>{editing ? 'Edit your log' : 'Write a log'}</label>
      <textarea
        id={fieldId}
        value={body}
        maxLength={BODY_MAX}
        onChange={(e) => setBody(e.target.value)}
        disabled={pending}
        aria-describedby={`${fieldId}-count`}
        required
      />
      <p className="log-form__count" id={`${fieldId}-count`}>
        {body.length} / {BODY_MAX}
      </p>
      <StarRating value={rating} onChange={setRating} disabled={pending} />
      {error && (
        <p className="log-form__error" role="alert">
          {error}
        </p>
      )}
      <div className="log-form__buttons">
        <button type="submit" disabled={pending}>
          {pending ? 'Saving…' : editing ? 'Save changes' : 'Post log'}
        </button>
        {editing && (
          <button type="button" className="button-secondary" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
