import { useEffect, useCallback } from 'react'

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  action: () => void
  description?: string
  preventDefault?: boolean
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Check if the event target is an input, textarea, or contenteditable
    const target = e.target as HTMLElement
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable
    
    // If typing in input, only allow Escape key
    if (isInput && e.key !== 'Escape') {
      return
    }
    
    // Normalize key
    const key = e.key === 'Escape' ? 'Escape' : e.key
    
    for (const shortcut of shortcuts) {
      // Check if Ctrl/Meta key matches
      const isCtrl = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true
      const isShift = shortcut.shift ? e.shiftKey : true
      const isAlt = shortcut.alt ? e.altKey : true
      const isKey = key.toLowerCase() === shortcut.key.toLowerCase()

      if (isKey && isCtrl && isShift && isAlt) {
        // Prevent browser default behavior
        e.preventDefault()
        e.stopPropagation()
        
        // Execute the action
        shortcut.action()
        break
      }
    }
  }, [shortcuts])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [handleKeyDown])
}