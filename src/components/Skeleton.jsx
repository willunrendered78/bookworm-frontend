// Placeholder cards while a list loads. Decorative: the list that owns them sets aria-busy.
export default function Skeleton({ count = 6, as = 'div', grid = false }) {
  const Tag = as
  return (
    <Tag className={grid ? 'skeleton-list skeleton-list--grid' : 'skeleton-list'} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span className="skeleton-card" key={i}>
          <span className="skeleton-card__cover" />
          <span className="skeleton-card__line" />
          <span className="skeleton-card__line skeleton-card__line--short" />
        </span>
      ))}
    </Tag>
  )
}
