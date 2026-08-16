import { useState } from 'react'
import { changePassword } from '../api/user'
import { useToast } from '../context/ToastContext'
import { Portal } from './Portal'

export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  if (!open) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ background: 'var(--overlay)' }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-xl p-6 space-y-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}>
          <h3 className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>Change password</h3>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-[13px]" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || !currentPassword || newPassword.length < 6} className="px-5 py-2 rounded-lg text-[13px] font-medium text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
              {saving ? 'Saving...' : 'Change password'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}