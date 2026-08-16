import { useState, useEffect } from 'react'
import client from '../api/client'
import { createConversation, getConversationMessages, type StoredMessage } from '../api/conversations'
import { useToast } from '../context/ToastContext'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'de', label: 'German' },
]

function langLabel(code: string) {
  return LANGUAGES.find(l => l.code === code)?.label ?? code
}

interface TranslateResult {
  verb: string
  object: string
  fullSentence: string
  grammarExplanation: string
}

interface HistoryEntry {
  sourceLang: string
  targetLang: string
  text: string
  result: TranslateResult
}

function CopyButton({ text, onCopied }: { text: string; onCopied: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      onCopied()
      setTimeout(() => setCopied(false), 1500)
    } catch {
      onCopied()
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy"
      className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:text-white"
      style={{ color: 'var(--text-tertiary)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
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
  )
}

interface TranslatorProps {
  onBack: () => void
  conversationId: number | null
  onConversationCreated: (id: number) => void
  onActivity: () => void
}

export function Translator({ onBack, conversationId, onConversationCreated, onActivity }: TranslatorProps) {
  const [sourceLang, setSourceLang] = useState('en')
  const [targetLang, setTargetLang] = useState('de')
  const [text, setText] = useState('')
  const [result, setResult] = useState<TranslateResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const toast = useToast()

  // Load conversation history
  useEffect(() => {
    if (conversationId) {
      getConversationMessages(conversationId).then((raw: StoredMessage[]) => {
        const entries: HistoryEntry[] = []
        let pendingInput: { sourceLang: string; targetLang: string; text: string } | null = null
        for (const m of raw) {
          try {
            const parsed = JSON.parse(m.content)
            if (m.role === 'user') {
              pendingInput = { 
                sourceLang: parsed.sourceLang, 
                targetLang: parsed.targetLang, 
                text: parsed.text 
              }
            } else if (m.role === 'assistant' && pendingInput) {
              entries.push({ ...pendingInput, result: parsed })
              pendingInput = null
            }
          } catch {
            // skip unparseable entries
          }
        }
        setHistory(entries)
        if (entries.length > 0) {
          const last = entries[entries.length - 1]
          setResult(last.result)
          // Restore source and target languages from last entry
          setSourceLang(last.sourceLang)
          setTargetLang(last.targetLang)
        }
      }).catch(() => setHistory([]))
    } else {
      setHistory([])
      setResult(null)
    }
  }, [conversationId])

  const swap = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setResult(null)
  }

  const translate = async () => {
    if (!text.trim() || sourceLang === targetLang) return

    let convId = conversationId
    if (!convId) {
      try {
        // Use 'TRANSLATE' type to keep translator conversations separate
        const created = await createConversation('TRANSLATE')
        convId = created.id
        onConversationCreated(convId)
      } catch (error) {
        toast.error('Failed to create conversation')
        return
      }
    }

    setLoading(true)
    try {
      // Send the request with source and target languages
      const res = await client.post('/api/translate', { 
        conversationId: convId,
        sourceLang: sourceLang,
        targetLang: targetLang,
        text: text.trim()
      })
      
      setResult(res.data)
      setHistory(prev => [...prev, { 
        sourceLang, 
        targetLang, 
        text: text.trim(), 
        result: res.data 
      }])
      onActivity()
    } catch (error: any) {
      console.error('Translation error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Translation failed'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={onBack} className="transition-colors text-lg leading-none" style={{ color: 'var(--text-tertiary)' }}>←</button>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI Translator</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="w-full lg:max-w-2xl lg:mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Translate text</h2>
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Select a source and target language, then enter your text.</p>
          </div>

          <div className="p-5 rounded-xl space-y-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}>
            <div className="flex items-center gap-2">
              <select
                value={sourceLang}
                onChange={e => { setSourceLang(e.target.value); setResult(null) }}
                className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>

              <button
                onClick={swap}
                title="Swap languages"
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              >
                ⇄
              </button>

              <select
                value={targetLang}
                onChange={e => { setTargetLang(e.target.value); setResult(null) }}
                className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                  Text to translate
                </label>
                {text.trim() && (
                  <CopyButton text={text} onCopied={() => toast.success('Copied')} />
                )}
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={4}
                placeholder={`Enter text in ${langLabel(sourceLang)}...`}
                className="w-full rounded-lg p-3 text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              onClick={translate}
              disabled={!text.trim() || loading || sourceLang === targetLang}
              className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Translating...' : 'Translate'}
            </button>
            {sourceLang === targetLang && (
              <p className="text-[12px] text-amber-500/90">Source and target language are the same.</p>
            )}
          </div>

          {result && (
            <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              <div className="px-5 py-4" style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
                    {langLabel(sourceLang)} → {langLabel(targetLang)}
                  </p>
                  <CopyButton text={result.fullSentence} onCopied={() => toast.success('Copied')} />
                </div>
                <p className="font-medium text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{result.fullSentence}</p>
              </div>

              <div className="p-5 space-y-3" style={{ background: 'var(--bg-surface-2)' }}>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Verb</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{result.verb}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Object</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{result.object}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Grammar</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{result.grammarExplanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Conversation History */}
          {history.length > 1 && (
            <div className="mt-6 pt-3 space-y-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Earlier in this session</p>
              {history.slice(0, -1).reverse().map((h, i) => (
                <div key={i} className="rounded-lg p-3 text-xs" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <p style={{ color: 'var(--text-tertiary)' }}>{h.text}</p>
                  <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{h.result.fullSentence}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}