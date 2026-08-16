import { useState, useEffect } from 'react'

interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutsHelpProps {
  onClose?: () => void
}

export function ShortcutsHelp({ onClose }: ShortcutsHelpProps = {}) {
  const shortcuts: ShortcutItem[] = [
    { keys: ['Ctrl', 'Enter'], description: 'Send message' },
    { keys: ['Ctrl', 'N'], description: 'New chat' },
    { keys: ['Ctrl', 'K'], description: 'Open shortcuts menu' },
    { keys: ['Esc'], description: 'Cancel editing / Close modals' },
    { keys: ['Ctrl', 'C'], description: 'Copy selected text' },
  ]

  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        if (onClose) onClose()
      }
    }
    document.addEventListener('keydown', handleEsc, true)
    return () => document.removeEventListener('keydown', handleEsc, true)
  }, [onClose])

  return (
    <div 
      data-shortcuts-help
      className="w-full max-w-md rounded-xl p-6 shadow-2xl border relative"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Keyboard Shortcuts
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-surface-2)]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {shortcuts.map((shortcut, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {shortcut.description}
            </span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, j) => (
                <kbd
                  key={j}
                  className="px-2 py-0.5 text-xs font-mono rounded"
                  style={{
                    background: 'var(--bg-surface-2)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
          Press <kbd className="px-1.5 py-0.5 text-xs font-mono rounded" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}>Esc</kbd> to close
        </p>
      </div>
    </div>
  )
}