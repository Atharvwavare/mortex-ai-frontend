import { useState, useEffect } from 'react'
import { useSettings, type SettingsSnapshot } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { ConfirmModal } from './ConfirmModal'
import client from '../api/client'
import { ShortcutsHelp } from './ShortcutsHelp'

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
]

function SectionIcon({ path }: { path: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  palette: 'M12 2a10 10 0 1 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2a3 3 0 0 0 3-3c0-5.5-4-9.4-8-9.4z M6.5 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M9 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M14 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  mic: 'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v1a7 7 0 0 1-14 0v-1 M12 18v4 M8 22h8',
  warning: 'M12 9v4 M12 17h.01 M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
}

const SWATCHES = ['#a855f7', '#2563eb', '#059669', '#e11d48', '#f97316', '#0891b2']

export function CustomizeModal({ open, onClose, onHistoryCleared }: {
  open: boolean; onClose: () => void; onHistoryCleared: () => void
}) {
 const { accent, setAccent, responseStyle, setResponseStyle, voiceLanguage, setVoiceLanguage, displayName, setDisplayName, theme, setTheme, customGreeting, setCustomGreeting, getSnapshot, restoreSnapshot } = useSettings()
  const toast = useToast()
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<SettingsSnapshot | null>(null)
  const [draftResponseStyle, setDraftResponseStyle] = useState(responseStyle)
  const [draftDisplayName, setDraftDisplayName] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const [draftCustomGreeting, setDraftCustomGreeting] = useState(customGreeting)
  const [showShortcuts, setShowShortcuts] = useState(false)

useEffect(() => {
  if (open) {
    setSnapshot(getSnapshot())
    setDraftResponseStyle(responseStyle)
    setDraftDisplayName(displayName)
    setDraftCustomGreeting(customGreeting)
  }
}, [open])

  if (!open) return null

const isDirty =
  snapshot !== null &&
  (accent !== snapshot.accent ||
    theme !== snapshot.theme ||
    draftResponseStyle !== snapshot.responseStyle ||
    voiceLanguage !== snapshot.voiceLanguage ||
    draftDisplayName !== snapshot.displayName ||
    draftCustomGreeting !== snapshot.customGreeting)

  const handleCancel = () => {
    if (snapshot) restoreSnapshot(snapshot)
    onClose()
  }

const handleSave = async () => {
  setSaving(true)
  try {
    if (draftResponseStyle !== snapshot?.responseStyle) {
      await setResponseStyle(draftResponseStyle)
    }
    if (draftDisplayName !== snapshot?.displayName) {
      await setDisplayName(draftDisplayName)
    }
    if (draftCustomGreeting !== snapshot?.customGreeting) {
      setCustomGreeting(draftCustomGreeting)
    }
    toast.success('Settings saved')
    onClose()
  } catch {
    toast.error('Failed to save settings')
  } finally {
    setSaving(false)
  }
}

  const handleClearAll = async () => {
    try {
      await client.delete('/api/conversations/all')
      toast.success('All chat history cleared')
      onHistoryCleared()
      setConfirmClearOpen(false)
      onClose()
    } catch {
      toast.error('Failed to clear history')
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={handleCancel}>
        <div
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[85vh]"
          style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2.5 px-6 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-tertiary)' }}><SectionIcon path={ICONS.settings} /></span>
            <h3 className="font-semibold text-[15px] flex-1" style={{ color: 'var(--text-primary)' }}>Settings</h3>
            <button onClick={handleCancel} className="text-lg leading-none transition-colors" style={{ color: 'var(--text-tertiary)' }}>×</button>
          </div>

          <div className="overflow-y-auto px-6 py-5 space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <SectionIcon path={ICONS.user} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Display name</p>
              </div>
              <input
                value={draftDisplayName}
                onChange={e => setDraftDisplayName(e.target.value)}
                maxLength={50}
                placeholder="What should we call you?"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>Used in greetings, e.g. "Hey there, what's up?"</p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <SectionIcon path={ICONS.sun} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Appearance</p>
              </div>
              <div className="flex gap-2 rounded-lg p-1" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                {(['dark', 'light'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className="flex-1 py-2.5 rounded-md text-[13px] font-medium capitalize transition-colors duration-150"
                    style={{
                      background: theme === t ? 'var(--accent)' : 'transparent',
                      color: theme === t ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <SectionIcon path={ICONS.palette} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Accent color</p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {SWATCHES.map(hex => (
                  <button
                    key={hex}
                    onClick={() => setAccent(hex)}
                    className="w-8 h-8 rounded-full transition-all duration-150 hover:scale-110"
                    style={{
                      background: hex,
                      outline: accent.toLowerCase() === hex.toLowerCase() ? '2px solid var(--text-primary)' : '2px solid transparent',
                      outlineOffset: '2px',
                    }}
                    title={hex}
                  />
                ))}
                <label
                  className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden"
                  style={{
                    background: !SWATCHES.some(s => s.toLowerCase() === accent.toLowerCase())
                      ? accent
                      : 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                    outline: !SWATCHES.some(s => s.toLowerCase() === accent.toLowerCase()) ? '2px solid var(--text-primary)' : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                  title="Custom color"
                >
                  <input
                    type="color"
                    value={accent}
                    onChange={e => setAccent(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
              </div>
              <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>Pick a swatch or tap the wheel for any color.</p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <SectionIcon path={ICONS.message} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Custom greeting</p>
              </div>
              <div className="relative">
                <input
                  value={draftCustomGreeting}
                  onChange={e => setDraftCustomGreeting(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. ready to build something? (use {name} to insert your name)"
                  className="w-full px-3.5 py-2.5 pr-9 rounded-lg text-[13px] outline-none transition-colors"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                />
                {draftCustomGreeting && (
                  <button
                    onClick={() => setDraftCustomGreeting('')}
                    title="Clear custom greeting"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Leave empty to use the default rotating greetings.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <SectionIcon path={ICONS.message} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Response style</p>
              </div>
              <div className="flex gap-2 rounded-lg p-1" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                {(['concise', 'detailed'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => setDraftResponseStyle(style)}
                    className="flex-1 py-2.5 rounded-md text-[13px] font-medium capitalize transition-colors duration-150"
                    style={{
                      background: draftResponseStyle === style ? 'var(--accent)' : 'transparent',
                      color: draftResponseStyle === style ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </section>
            
            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <SectionIcon path={ICONS.mic} />
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Voice input language</p>
              </div>
              <select
                value={voiceLanguage}
                onChange={e => setVoiceLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-colors cursor-pointer"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </section>

            {/* --- KEYBOARD SHORTCUTS SECTION --- */}
            <section>
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3L21 21" />
                  <path d="M21 3L3 21" />
                  <path d="M15 9L9 15" />
                </svg>
                <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Keyboard Shortcuts</p>
              </div>
              <button
                onClick={() => setShowShortcuts(true)}
                className="w-full py-3 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center justify-between px-4"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-input)';
                  e.currentTarget.style.borderColor = 'var(--border-default)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <span className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3L21 21" />
                    <path d="M21 3L3 21" />
                    <path d="M15 9L9 15" />
                  </svg>
                  View Keyboard Shortcuts
                </span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono rounded" style={{
                  background: 'var(--bg-surface-2)',
                  color: 'var(--text-tertiary)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  ⌘K
                </kbd>
              </button>
            </section>

            {/* --- DANGER ZONE SECTION --- */}
            <section className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-3" style={{ color: '#ef4444' }}>
                <SectionIcon path={ICONS.warning} />
                <p className="text-[11px] font-semibold uppercase tracking-wide">Danger zone</p>
              </div>
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="w-full py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-200"
                style={{
                  color: '#ef4444',
                  background: 'var(--bg-input)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-input)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                }}
              >
                Clear all chat history
              </button>
            </section>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-opacity duration-150 disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {saving ? 'Saving...' : isDirty ? 'Save changes' : 'Done'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmClearOpen}
        title="Clear all chat history?"
        message="This permanently deletes every conversation and message across your account. This can't be undone."
        confirmLabel="Clear everything"
        onCancel={() => setConfirmClearOpen(false)}
        onConfirm={handleClearAll}
      />

      {/* Shortcuts Help Modal - Rendered outside the main modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div 
            className="absolute inset-0" 
            style={{ background: 'var(--overlay)' }}
            onClick={() => setShowShortcuts(false)}
          />
          <div className="relative z-10">
            <ShortcutsHelp onClose={() => setShowShortcuts(false)} />
          </div>
        </div>
      )}
    </>
  )
}