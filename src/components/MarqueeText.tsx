import { useRef, useState, useEffect } from 'react'

export function MarqueeText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      setOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth)
    }
  }, [text])

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className || ''}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <span
        ref={textRef}
        className="inline-block"
        style={
          overflowing && hovering
            ? { animation: `marquee ${Math.max(text.length * 0.15, 3)}s linear infinite` }
            : undefined
        }
      >
        {text}
      </span>
    </div>
  )
}