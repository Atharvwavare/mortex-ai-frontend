import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
  duration: number
}

interface ToastContextType {
  toasts: ToastItem[]
  show: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let nextId = 1
const MAX_TOASTS = 5 // Prevent memory leaks from spam

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = nextId++
    setToasts(prev => {
      const newToasts = [...prev, { id, type, message, duration }]
      // If we have too many, remove the oldest one
      if (newToasts.length > MAX_TOASTS) {
        return newToasts.slice(newToasts.length - MAX_TOASTS)
      }
      return newToasts
    })
  }, [])

  const value: ToastContextType = {
    toasts,
    show,
    success: (m, d) => show('success', m, d),
    error: (m, d) => show('error', m, d),
    info: (m, d) => show('info', m, d),
    warning: (m, d) => show('warning', m, d),
    dismiss,
  }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}