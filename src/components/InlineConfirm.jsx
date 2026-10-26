import { useEffect, useRef } from 'react'
import './InlineConfirm.css'

// Confirm step shown in place, instead of window.confirm. Focus starts on Cancel; Escape cancels.
export default function InlineConfirm({ message, confirmLabel = 'Confirm', pending = false, onConfirm, onCancel }) {
  const cancelRef = useRef(null)

  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  return (
    <div
      className="inline-confirm"
      role="group"
      aria-label="Please confirm"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !pending) onCancel()
      }}
    >
      <p>{message}</p>
      <div className="inline-confirm__buttons">
        <button type="button" className="button-danger" onClick={onConfirm} disabled={pending}>
          {pending ? 'Working…' : confirmLabel}
        </button>
        <button type="button" className="button-quiet" onClick={onCancel} disabled={pending} ref={cancelRef}>
          Cancel
        </button>
      </div>
    </div>
  )
}
