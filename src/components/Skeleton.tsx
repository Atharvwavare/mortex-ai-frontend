interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circle' | 'rect'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseStyles: React.CSSProperties = {
    background: 'var(--bg-surface-2)',
    borderRadius: variant === 'circle' ? '50%' : '4px',
    width: width || '100%',
    height: height || (variant === 'text' ? '0.8rem' : '100%'),
    animation: 'pulse 1.5s ease-in-out infinite',
  }

  if (variant === 'text') {
    return (
      <div className={`${className}`} style={baseStyles}>
        &nbsp;
      </div>
    )
  }

  return <div className={className} style={baseStyles} />
}

export function MessageSkeleton() {
  return (
    <div className="flex items-start gap-3 py-4">
      <Skeleton variant="circle" width={32} height={32} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="40%" height={14} />
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    </div>
  )
}