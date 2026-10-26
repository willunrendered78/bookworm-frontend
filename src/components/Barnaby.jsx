import './Barnaby.css'

// Decorative mascot: nearby text carries the meaning, so the image has an empty alt.
const PIXELS = { sm: 96, md: 192, lg: 160, xl: 320 }

export default function Barnaby({ size = 'lg' }) {
  const px = PIXELS[size] ?? PIXELS.lg
  return (
    <span className={`barnaby barnaby--${size}`}>
      <img src="/brand/barnaby.svg" alt="" width={px} height={px} />
    </span>
  )
}
