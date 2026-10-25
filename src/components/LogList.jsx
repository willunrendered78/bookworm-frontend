import { formatDate } from '../lib/text.js'

function Stars({ rating }) {
  return (
    <span className="log-item__rating" role="img" aria-label={`Rated ${rating} out of 5`}>
      {'★'.repeat(rating)}
      <span className="log-item__rating-empty">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

// Logs as a list. renderActions(log) and renderEditor(log) are optional and only used for my own logs.
export default function LogList({ logs, currentUserId, editingId, renderActions, renderEditor }) {
  return (
    <ul className="log-list">
      {logs.map((log) => {
        const mine = Boolean(currentUserId) && log.user_id === currentUserId
        if (mine && editingId === log.id && renderEditor) {
          return (
            <li key={log.id} className="log-item">
              {renderEditor(log)}
            </li>
          )
        }
        const name = log.profiles?.display_name || 'Reader'
        const edited = log.updated_at && log.created_at && log.updated_at !== log.created_at
        return (
          <li key={log.id} className="log-item">
            <div className="log-item__header">
              <strong className="log-item__name">{name}</strong>
              <time dateTime={log.created_at}>{formatDate(log.created_at)}</time>
              {Number.isInteger(log.rating) && log.rating >= 1 && log.rating <= 5 && <Stars rating={log.rating} />}
              {edited && <span className="log-item__edited">(edited)</span>}
            </div>
            <p className="log-item__body">{log.body}</p>
            {mine && renderActions && renderActions(log)}
          </li>
        )
      })}
    </ul>
  )
}
