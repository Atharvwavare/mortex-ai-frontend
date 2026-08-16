import { memo, useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Star } from './Logo'
import { MermaidDiagram } from './MermaidDiagram'
import { useToast } from '../context/ToastContext'
import type { StoredMessage } from '../api/conversations'
import { useSettings } from '../context/SettingsContext'
import { MarkDownRenderer } from './MarkDownRenderer'

interface MessageListProps {
  messages: StoredMessage[]
  loading: boolean
  editingId: number | null
  editValue: string
  onEditValueChange: (v: string) => void
  onStartEdit: (msg: StoredMessage) => void
  onCancelEdit: () => void
  onSaveEdit: (msg: StoredMessage) => void
  bottomRef: React.RefObject<HTMLDivElement | null>
}

const GREETING_TEMPLATES = [
  "Hey {name}, what's up?",
  "Good to see you, {name}.",
  "What are we building today, {name}?",
  "{name}, ready when you are.",
  "Let's get to work, {name}.",
]

function withName(template: string, firstName?: string) {
  if (firstName) return template.replace('{name}', firstName)
  return template.replace(/,?\s*\{name\}/, '').replace(/\s+([,.!?])/, '$1')
}

function getGreetings(name?: string, customGreeting?: string) {
  const firstName = name?.trim().split(' ')[0]
  const trimmedCustom = customGreeting?.trim()

  const templates = GREETING_TEMPLATES.map(t => withName(t, firstName))

  if (trimmedCustom) {
    const customLine = trimmedCustom.includes('{name}')
      ? withName(trimmedCustom, firstName)
      : trimmedCustom
    return [customLine, ...templates]
  }

  return templates
}

function RotatingGreeting() {
  const { displayName, loaded, customGreeting } = useSettings()
  const greetings = getGreetings(displayName, customGreeting)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (greetings.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => (prev + 1) % greetings.length)
        setVisible(true)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [greetings.length])

  if (!loaded) return <h1 className="text-4xl font-semibold text-transparent select-none" style={{ fontFamily: "'Fraunces', serif" }}>&nbsp;</h1>

  return (
    <h1
      className="text-4xl font-semibold transition-opacity duration-300 text-center px-4"
      style={{ fontFamily: "'Fraunces', serif", opacity: visible ? 1 : 0, color: 'var(--text-primary)' }}
    >
      {greetings[index]}
    </h1>
  )
}

// Message Actions Component - Removed regenerate button
function MessageActions({ 
  content, 
  visible 
}: { 
  content: string
  visible: boolean 
}) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className={`flex items-center gap-1 transition-opacity duration-150 ${visible ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
      <button
        onClick={handleCopy}
        className="p-1 rounded-md transition-colors hover:bg-[var(--bg-surface-2)]"
        style={{ color: 'var(--text-tertiary)' }}
        title="Copy message"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}

function MessageListInner({
  messages, loading, editingId, editValue, onEditValueChange,
  onStartEdit, onCancelEdit, onSaveEdit, bottomRef,
}: MessageListProps) {
  const [tappedId, setTappedId] = useState<number | null>(null)

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Star size={48} />
        <RotatingGreeting />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {messages.map((m) => {
        const isTapped = tappedId === m.id
        return (
          <div key={m.id} className={`group flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {m.role === 'assistant' && (
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: 'var(--accent)' }} 
              >
                <Star size={16} color="#ffffff" />
              </div>
            )}

            {editingId === m.id ? (
              <div className="flex-1 max-w-[85%] flex flex-col gap-2">
                <textarea
                  autoFocus
                  value={editValue}
                  onChange={e => onEditValueChange(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl p-3 text-sm outline-none resize-none"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={onCancelEdit} className="text-xs px-3 py-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                  <button onClick={() => onSaveEdit(m)} className="text-xs px-3 py-1.5 rounded-lg text-white" style={{ background: 'var(--accent)' }}>Save & regenerate</button>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[85%] flex flex-col gap-1">
                <div className={`flex items-start gap-1.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {m.role === 'user' && (
                    <button
                      onClick={() => onStartEdit(m)}
                      className={`text-xs mt-2 flex-shrink-0 transition-opacity duration-150 ${
                        isTapped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      style={{ color: 'var(--text-tertiary)' }}
                      title="Edit message"
                    >
                      ✎
                    </button>
                  )}
                  <div
                    onClick={() => setTappedId(prev => (prev === m.id ? null : m.id))}
                    className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
                    style={{
                      background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-surface)',
                      color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                      border: m.role === 'assistant' ? '1px solid var(--border-default)' : 'none',
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.role === 'assistant' ? (
                      <MarkDownRenderer content={m.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>

                {/* Message Actions - Show on hover or tap (only copy now) */}
                {m.role === 'assistant' && (
                  <div className={`pl-1 transition-opacity duration-150 ${isTapped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <MessageActions 
                      content={m.content}
                      visible={isTapped}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-start gap-3">
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            style={{ background: 'var(--accent)' }}
          >
            <Star size={16} color="#ffffff" />
          </div>
          <div className="px-4 py-2.5 rounded-2xl flex items-center gap-1.5"
               style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: 'var(--accent)' }} />
            <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: 'var(--accent)' }} />
          </div>
        </div>
      )}
      
      <div ref={bottomRef} />
    </div>
  )
}

export const MessageList = memo(MessageListInner)