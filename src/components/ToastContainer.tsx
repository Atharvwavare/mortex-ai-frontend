import { useEffect, useState } from 'react'
import { useToast, type ToastItem, type ToastType } from '../context/ToastContext'
import { useSettings } from '../context/SettingsContext'

// Professional colors that work with both dark and light modes
const STYLES: Record<ToastType, { iconColor: string; borderColor: string }> = {
  warning: { 
    iconColor: '#eab308',
    borderColor: 'rgba(234, 179, 8, 0.3)'
  },
  info: { 
    iconColor: '#3b82f6',
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  error: { 
    iconColor: '#ef4444',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  success: { 
    iconColor: '#22c55e',
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
}

function Icon({ type, color }: { type: ToastType; color: string }) {
  const common = { 
    width: 16, 
    height: 16, 
    viewBox: '0 0 24 24', 
    fill: 'none', 
    stroke: color, 
    strokeWidth: 2.2
  }
  
  if (type === 'warning') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
    )
  }
  
  if (type === 'info') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    )
  }
  
  if (type === 'error') {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </svg>
    )
  }

  // Success
  return (
    <svg {...common} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function Toast({ toast }: { toast: ToastItem }) {
  const { dismiss } = useToast()
  const { theme } = useSettings()
  const [visible, setVisible] = useState(false)
  const style = STYLES[toast.type]
  
  const isDark = theme === 'dark'

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-out backdrop-blur-sm border"
      style={{
        background: isDark ? 'rgba(26, 26, 36, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: style.borderColor,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        minWidth: 280,
        maxWidth: 380,
        color: isDark ? 'var(--text-primary)' : 'var(--text-primary)',
        boxShadow: isDark 
          ? '0 4px 24px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)' 
          : '0 4px 24px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Accent color bar on the left */}
      <div 
        className="absolute left-0 top-0 bottom-0 rounded-l-lg"
        style={{ 
          width: '3px',
          background: style.iconColor,
        }}
      />
      
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 relative z-10">
        <Icon type={toast.type} color={style.iconColor} />
        <span className="flex-1 text-[13px] font-medium leading-relaxed" style={{ color: isDark ? '#f0eeff' : '#16161d' }}>
          {toast.message}
        </span>
      </div>
      
      {/* Progress bar with accent color */}
      <div 
        className="absolute bottom-0 left-0 h-[2px]"
        style={{ 
          width: '100%', 
          background: style.iconColor,
          opacity: 0.4,
          animation: `shrink ${toast.duration}ms linear forwards` 
        }}
        onAnimationEnd={() => dismiss(toast.id)}
      />
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToast()
  
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} />
        </div>
      ))}
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}