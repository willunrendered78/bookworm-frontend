import { useId } from 'react'

// Optional 1 to 5 rating as a radio group. value is null (no rating) or 1 to 5.
export default function StarRating({ value, onChange, disabled }) {
  const name = useId()
  const options = [{ v: null, label: 'No rating' }, ...[1, 2, 3, 4, 5].map((n) => ({ v: n, label: `${n} ★` }))]

  return (
    <fieldset className="star-rating" disabled={disabled}>
      <legend>Rating (optional)</legend>
      <div className="star-rating__options">
        {options.map((option) => (
          <label className="star-rating__option" key={option.label}>
            <input
              type="radio"
              name={name}
              checked={value === option.v}
              onChange={() => onChange(option.v)}
              aria-label={option.v ? `${option.v} out of 5` : 'No rating'}
            />
            <span aria-hidden="true">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
