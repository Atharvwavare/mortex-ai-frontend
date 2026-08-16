import { useState, useRef, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { deleteAccount } from '../api/user'
import { EditProfileModal } from './EditProfileModal'
import { ChangePasswordModal } from './ChangePasswordModal'
import { ConfirmModal } from './ConfirmModal'

interface UserMenuProps {
  onOpenCustomize?: () => void
}

export function UserMenu({ onOpenCustomize }: UserMenuProps = {}) {
  const { displayName, theme, setTheme } = useSettings()
  const { logout, username } = useAuth()
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    setConfirmLogoutOpen(prev => !prev)
  }

  const confirmLogout = () => {
    logout()
    toast.info('Logged out')
    setConfirmLogoutOpen(false)
  }

  const handleDeleteAccount = () => { 
    setIsOpen(false) 
    setConfirmDeleteOpen(prev => !prev) 
  }

  const confirmDeleteAccount = async () => {
    try {
      await deleteAccount()
      toast.success('Account deleted')
      logout()
    } catch {
      toast.error('Failed to delete account')
    }
    setConfirmDeleteOpen(false)
  }

  const handleEditProfile = () => { 
    setIsOpen(false) 
    setEditProfileOpen(prev => !prev) 
  }

  const handleChangePassword = () => { 
    setIsOpen(false) 
    setChangePasswordOpen(prev => !prev) 
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    toast.info(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`)
    setIsOpen(false)
  }

  // Get the first letter for the avatar
  const initial = username?.trim()?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="relative w-full" ref={menuRef}>
      {/* --- TRIGGER BUTTON --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-3 transition-colors duration-200 rounded-lg"
        style={{
          background: isOpen ? 'var(--bg-surface)' : 'transparent',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* User Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {initial}
          </div>

          {/* User Name */}
          <span
            className="text-[14px] font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {displayName || username || 'User'}
          </span>
        </div>

        {/* Chevron Icon (Rotates when open) */}
        <div
          className="transition-transform duration-200 flex-shrink-0 ml-2"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            color: 'var(--text-tertiary)' 
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* --- DROPDOWN MENU --- */}
      {isOpen && (
        <div
          className="absolute bottom-full left-0 w-full mb-1.5 rounded-xl shadow-xl overflow-hidden border animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)'
          }}
        >
          <div className="py-1">
            {/* User Info Header in Dropdown */}
            <div className="px-4 py-2 mb-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {displayName || username}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {username}
              </p>
            </div>

            {/* --- THEME TOGGLE --- */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2 text-[14px] transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>

            <div className="h-px my-1" style={{ background: 'var(--border-subtle)' }} />

            {/* --- ACCOUNT SETTINGS --- */}
            <button
              onClick={handleEditProfile}
              className="w-full flex items-center gap-3 px-4 py-2 text-[14px] transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Edit Profile
            </button>

            <button
              onClick={handleChangePassword}
              className="w-full flex items-center gap-3 px-4 py-2 text-[14px] transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Change Password
            </button>

            <div className="h-px my-1" style={{ background: 'var(--border-subtle)' }} />

            {/* --- DANGER ZONE --- */}
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center gap-3 px-4 py-2 text-[14px] transition-colors duration-150"
              style={{ color: '#ef4444' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
              Delete Account
            </button>

            <div className="h-px my-1" style={{ background: 'var(--border-subtle)' }} />

            {/* --- LOGOUT --- */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-[14px] transition-colors duration-150"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}

      <EditProfileModal open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />
      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />

      <ConfirmModal
        open={confirmLogoutOpen}
        title="Log out?"
        message="You'll need to sign in again to continue."
        confirmLabel="Log out"
        onCancel={() => setConfirmLogoutOpen(false)}
        onConfirm={confirmLogout}
      />

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Delete your account?"
        message="This permanently deletes your account, all conversations, and all settings. This cannot be undone."
        confirmLabel="Delete account"
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteAccount}
      />
    </div>
  )
}