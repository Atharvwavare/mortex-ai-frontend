export function Star({ size = 40, color }: { size?: number; color?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* If color is passed, use it. If not, fallback to the theme accent */}
      <g fill={color || "var(--accent)"}>
        <path d="M18 90 V10 L50 45 L82 10 V90 H70 V45 L50 65 L30 45 V90 Z" />
      </g>
    </svg>
  )
}