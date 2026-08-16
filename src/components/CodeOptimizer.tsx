import { useState, useRef, useEffect } from 'react'
import client from '../api/client'
import { createConversation, getConversationMessages, type StoredMessage } from '../api/conversations'
import { useToast } from '../context/ToastContext'

interface CodeMessage {
  role: 'user' | 'assistant'
  code?: string
  language?: string
  data?: any
  error?: string
}

const LANGUAGES = ['java', 'python', 'typescript', 'javascript', 'go', 'rust', 'c++', 'c#']

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-[10px] font-medium tracking-wide uppercase transition-colors"
      style={{ color: 'var(--text-tertiary)' }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

interface CodeOptimizerProps {
  conversationId: number | null
  onConversationCreated: (id: number) => void
  onActivity: () => void
}

export function CodeOptimizer({ conversationId, onConversationCreated, onActivity }: CodeOptimizerProps) {
  const [messages, setMessages] = useState<CodeMessage[]>([])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState('java')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toast = useToast()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    if (conversationId) {
      getConversationMessages(conversationId).then((raw: StoredMessage[]) => {
        const parsed: CodeMessage[] = raw.map(m => {
          try {
            const parsed = JSON.parse(m.content)
            return m.role === 'user'
              ? { role: 'user' as const, code: parsed.code, language: parsed.language }
              : { role: 'assistant' as const, data: parsed }
          } catch {
            return { role: m.role, error: m.content }
          }
        })
        setMessages(parsed)
      }).catch(() => setMessages([]))
    } else {
      setMessages([])
    }
  }, [conversationId])

  const autoResize = () => {
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 400) + 'px' }
  }

  const submit = async () => {
    const code = input.trim()
    if (!code || loading) return

    let convId = conversationId
    if (!convId) {
      const created = await createConversation('CODE')
      convId = created.id
      onConversationCreated(convId)
    }

    setMessages(prev => [...prev, { role: 'user', code, language }])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)
    try {
      const res = await client.post('/api/optimize-code', { conversationId: convId, code, language })
      setMessages(prev => [...prev, { role: 'assistant', data: res.data }])
      onActivity()
    } catch (err: any) {
      const message = err.response?.data?.error || 'Optimization failed. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', error: message }])
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface-2)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Code Optimizer</span>
        </div>

        <div className="relative">
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-md text-[11px] font-medium outline-none cursor-pointer transition-colors capitalize"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: 'var(--text-tertiary)' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-2">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg mb-1"
                style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>Paste code to get started</p>
              <p className="text-[11px] max-w-[280px]" style={{ color: 'var(--text-tertiary)' }}>Optimized output, complexity comparison, and a summary of every change will appear here.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[85%] group">
                  <div className="flex items-center justify-between mb-1 px-0.5">
                    <span className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'var(--text-tertiary)' }}>Input</span>
                  </div>
                  <pre
                    className="px-3.5 py-3 rounded-lg text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-words"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                  >
                    {msg.code}
                  </pre>
                </div>
              ) : msg.data ? (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1 px-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium tracking-wide uppercase" style={{ color: 'var(--accent)' }}>Optimized</span>
                      {msg.data.complexityBefore && msg.data.complexityAfter && (
                        <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                          <span className="line-through opacity-60">{msg.data.complexityBefore}</span>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                          <span style={{ color: '#22c55e' }}>{msg.data.complexityAfter}</span>
                        </span>
                      )}
                    </div>
                    <CopyButton text={msg.data.optimizedCode} />
                  </div>

                  <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}>
                    <pre
                      className="text-[11px] leading-relaxed font-mono overflow-x-auto whitespace-pre-wrap break-words px-3.5 py-3"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {msg.data.optimizedCode}
                    </pre>

                    {msg.data.changesExplained?.length > 0 && (
                      <div className="px-3.5 py-3 space-y-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        {msg.data.changesExplained.map((c: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            <span className="mt-[5px] w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-start gap-2 text-[12px] rounded-lg px-3.5 py-2.5"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {msg.error}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 px-0.5">
              <span className="flex gap-1">
                <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ background: 'var(--accent)' }} />
                <span className="w-1 h-1 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ background: 'var(--accent)' }} />
                <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--accent)' }} />
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Optimizing</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <div
          className="max-w-2xl mx-auto rounded-xl px-3.5 py-3 transition-colors"
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={onKeyDown}
            placeholder="Paste your code here..."
            rows={4}
            className="w-full resize-none bg-transparent outline-none text-[11px] leading-relaxed font-mono"
            style={{ color: 'var(--text-primary)' }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>⌘ Enter to submit</span>
            <button
              onClick={submit}
              disabled={!input.trim() || loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Optimizing...' : 'Optimize'}
              {!loading && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}