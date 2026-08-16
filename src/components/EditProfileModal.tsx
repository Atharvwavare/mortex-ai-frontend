import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../context/ToastContext'
import { Portal } from './Portal'

export function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { displayName, setDisplayName } = useSettings()
  const [draft, setDraft] = useState(displayName)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  if (!open) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDisplayName(draft)
      toast.success('Profile updated')
      onClose()
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-xl p-6 space-y-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}>
          <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Edit profile</h3>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            maxLength={50}
            placeholder="Display name"
            className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg text-[13px] font-medium text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}