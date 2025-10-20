interface LoaderProps {
  size?: number // 1-10 scale
  color?: string
}

export default function Loader({ size = 4, color = '#4f46e5' }: LoaderProps) {
  const dimension = size * 4 // 4px per size unit
  return (
    <svg
      className="animate-spin"
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M22 12a10 10 0 0 1-10 10" />
    </svg>
  )
}
