import { useState } from 'react'
import { Star } from './Logo'
import { GoogleSignInButton } from './GoggleSignInButton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSettings } from '../context/SettingsContext'

export function SignInScreen({ onNext }: { onNext: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, register, loginWithGoogle } = useAuth()
  const toast = useToast()
  const { accent } = useSettings()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password || (mode === 'register' && !email)) {
      toast.error('Please fill in all fields')
      return
    }
    
    setIsLoading(true)
    try {
      if (mode === 'login') {
        await login(username, password)
        toast.success('Welcome back!')
      } else {
        await register(username, email, password)
        toast.success('Account created!')
      }
      onNext()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async (idToken: string) => {
    setIsLoading(true)
    try {
      await loginWithGoogle(idToken)
      toast.success('Welcome!')
      onNext()
    } catch {
      toast.error('Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6" style={{ background: 'var(--bg-app)' }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 gap-4">
          <div className="p-3 rounded-full" style={{ background: `${accent}15` }}>
            <Star size={36} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold" style={{ 
              fontFamily: "'Fraunces', serif", 
              color: 'var(--text-primary)' 
            }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {mode === 'login' 
                ? 'Sign in to continue chatting with Mortex AI' 
                : 'Start your journey with Mortex AI'}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl p-6 flex flex-col gap-4" style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--border-default)' 
        }}>
          {/* Google Sign In */}
          <GoogleSignInButton 
            onIdToken={handleGoogleSignIn} 
          />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
              OR CONTINUE WITH EMAIL
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full py-3.5 px-4 rounded-xl text-sm bg-transparent outline-none transition-all duration-150 placeholder:text-sm"
                style={{ 
                  color: 'var(--text-primary)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = accent}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                disabled={isLoading}
              />
            </div>

            {mode === 'register' && (
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full py-3.5 px-4 rounded-xl text-sm bg-transparent outline-none transition-all duration-150 placeholder:text-sm"
                  style={{ 
                    color: 'var(--text-primary)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = accent}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full py-3.5 px-4 rounded-xl text-sm bg-transparent outline-none transition-all duration-150 placeholder:text-sm pr-12"
                style={{ 
                  color: 'var(--text-primary)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = accent}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                style={{ color: 'var(--text-tertiary)' }}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-medium text-sm transition-all duration-200 relative overflow-hidden"
              style={{ 
                background: isLoading ? 'var(--text-tertiary)' : accent,
                color: 'white',
                boxShadow: `0 4px 16px ${accent}30`,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = `0 6px 24px ${accent}40`
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = `0 4px 16px ${accent}30`
                }
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Toggle Mode */}
        <button 
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setUsername('')
            setEmail('')
            setPassword('')
          }}
          className="mt-4 w-full text-center text-xs transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
          disabled={isLoading}
        >
          {mode === 'login' 
            ? "Don't have an account? Create one" 
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}