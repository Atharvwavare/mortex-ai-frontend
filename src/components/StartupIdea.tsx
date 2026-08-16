import { useState } from 'react'
import client from '../api/client'
import { useToast } from '../context/ToastContext'

function Field({ label, optional, value, onChange, placeholder }: {
  label: string; optional?: boolean; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
        {label}
        {optional && <span className="normal-case font-normal" style={{ color: 'var(--text-faint)' }}>(optional)</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition-colors"
        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
      />
    </div>
  )
}

function ResultRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value}</p>
    </div>
  )
}

function ResultList({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--accent)] flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StartupIdea({ onBack }: { onBack: () => void }) {
  const [idea, setIdea] = useState('')
  const [problem, setProblem] = useState('')
  const [solution, setSolution] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const generate = async () => {
    if (!idea.trim()) return
    setLoading(true)
    try {
      const res = await client.post('/api/startup-idea', { idea, problem, solution })
      setResult(res.data)
      toast.success('Idea generated')
    } catch {
      toast.error('Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={onBack} className="transition-colors text-lg leading-none" style={{ color: 'var(--text-tertiary)' }}>←</button>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Startup Idea Generator</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-xl mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Draft a business plan</h2>
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Describe your idea and get a structured plan in seconds.</p>
          </div>

          <div className="space-y-4 p-5 rounded-xl" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}>
            <Field label="Your idea" value={idea} onChange={setIdea} placeholder="e.g. A subscription box for indoor plants" />
            <Field label="Problem" optional value={problem} onChange={setProblem} placeholder="What pain point does this solve?" />
            <Field label="Solution" optional value={solution} onChange={setSolution} placeholder="How does your idea solve it?" />

            <button
              onClick={generate}
              disabled={!idea.trim() || loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Generating plan...' : 'Generate plan'}
            </button>
          </div>

          {result && (
            <div className="mt-5 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
              <div className="px-5 py-4" style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-subtle)' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--accent)' }}>Business Plan</p>
                <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{result.idea}</h3>
              </div>

              <div className="p-5 space-y-5" style={{ background: 'var(--bg-surface-2)' }}>
                <div className="grid grid-cols-1 gap-4">
                  <ResultRow label="Problem" value={result.problem} />
                  <ResultRow label="Solution" value={result.solution} />
                  <ResultRow label="Time to launch" value={result.estimatedTimeToLaunch} />
                </div>

                {(result.benefits?.length > 0 || result.stepsToEfficiency?.length > 0) && (
                  <div className="pt-1 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <ResultList label="Benefits" items={result.benefits} />
                    <ResultList label="Steps to efficiency" items={result.stepsToEfficiency} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}