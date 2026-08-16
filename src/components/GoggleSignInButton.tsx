import { useSettings } from '../context/SettingsContext'
import { useRef } from 'react'

interface GoogleSignInButtonProps {
  onIdToken: (idToken: string) => void
  disabled?: boolean
}

export function GoogleSignInButton({ onIdToken, disabled }: GoogleSignInButtonProps) {
  const { accent, theme } = useSettings()
  const initialized = useRef(false)

  // Detect if the user is on a mobile device
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)

  const handleGoogleSignIn = () => {
    if (disabled) return

    if (isMobile) {
      // --- MOBILE: Use the Redirect Method (100% reliable) ---
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      const redirectUri = window.location.origin
      
      window.location.href = 
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=id_token&` +
        `scope=openid%20profile%20email&` +
        `nonce=${Math.random().toString(36).substring(2)}`
      
    } else {
      // --- DESKTOP: Use the normal Popup/One Tap ---
      if (!initialized.current && (window as any).google) {
        ;(window as any).google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (response.credential) {
              onIdToken(response.credential)
            }
          },
          use_fedcm_for_prompt: true,
        })
        initialized.current = true
      }
      ;(window as any).google.accounts.id.prompt()
    }
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={disabled}
      className="w-full py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200"
      style={{
        background: isDark ? 'var(--bg-input)' : 'white',
        color: isDark ? 'var(--text-primary)' : '#1a1a24',
        border: `1px solid ${isDark ? 'var(--border-default)' : '#e5e7eb'}`,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = accent
          e.currentTarget.style.boxShadow = `0 0 0 2px ${accent}25, 0 2px 4px rgba(0,0,0,0.1)`
          if (isDark) e.currentTarget.style.background = `${accent}10`
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = isDark ? 'var(--border-default)' : '#e5e7eb'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
          if (isDark) e.currentTarget.style.background = 'var(--bg-input)'
        }
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span>Continue with Google</span>
    </button>
  )
}