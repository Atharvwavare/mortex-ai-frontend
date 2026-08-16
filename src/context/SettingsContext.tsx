import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import client from '../api/client'

type ResponseStyle = 'concise' | 'detailed'
type Theme = 'dark' | 'light'

interface SettingsSnapshot {
  accent: string
  responseStyle: ResponseStyle
  voiceLanguage: string
  displayName: string
  theme: Theme
  customGreeting: string
}

interface SettingsContextType extends SettingsSnapshot {
  setAccent: (hex: string) => void
  setResponseStyle: (style: ResponseStyle) => Promise<void>
  setVoiceLanguage: (lang: string) => void
  setDisplayName: (name: string) => Promise<void>
  setTheme: (t: Theme) => void
  setCustomGreeting: (text: string) => Promise<void>
  clearCustomGreeting: () => Promise<void>
  getSnapshot: () => SettingsSnapshot
  restoreSnapshot: (s: SettingsSnapshot) => void
  loaded: boolean
}

const SettingsContext = createContext<SettingsContextType | null>(null)

function shade(hex: string, amount: number) {
  const n = hex.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(n.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(n.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(n.substring(4, 6), 16) + amount))
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

// Apply all theme variables
function applyFullTheme(accent: string, theme: Theme) {
  // Accent
  document.documentElement.style.setProperty('--accent', accent)
  document.documentElement.style.setProperty('--accent-hover', shade(accent, -40))
  
  // Theme
  document.documentElement.setAttribute('data-theme', theme)
  
  // All theme colors
  const themeColors = theme === 'dark' ? {
    '--bg-app': '#111117',
    '--bg-surface': '#1a1a24',
    '--bg-surface-2': '#16161d',
    '--bg-input': '#1a1a24',
    '--bg-inset': '#111117',
    '--text-primary': '#f0eeff',
    '--text-secondary': '#9ca3af',
    '--text-tertiary': '#6b7280',
    '--text-faint': '#4b5563',
    '--border-subtle': 'rgba(255,255,255,0.06)',
    '--border-default': 'rgba(255,255,255,0.08)',
    '--border-strong': 'rgba(255,255,255,0.2)',
    '--overlay': 'rgba(0,0,0,0.6)',
  } : {
    '--bg-app': '#f7f7fb',
    '--bg-surface': '#ffffff',
    '--bg-surface-2': '#f1f1f6',
    '--bg-input': '#ffffff',
    '--bg-inset': '#eeeef3',
    '--text-primary': '#16161d',
    '--text-secondary': '#52525b',
    '--text-tertiary': '#71717a',
    '--text-faint': '#a1a1aa',
    '--border-subtle': 'rgba(0,0,0,0.06)',
    '--border-default': 'rgba(0,0,0,0.1)',
    '--border-strong': 'rgba(0,0,0,0.25)',
    '--overlay': 'rgba(0,0,0,0.35)',
  }
  
  Object.entries(themeColors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value)
  })
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Get initial values from localStorage
  const initialAccent = localStorage.getItem('accent') || '#a855f7'
  const initialTheme = (localStorage.getItem('theme') as Theme) || 'dark'

  // Apply theme BEFORE any state initialization
  applyFullTheme(initialAccent, initialTheme)

  const [accent, setAccentState] = useState<string>(initialAccent)
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [responseStyle, setResponseStyleState] = useState<ResponseStyle>('concise')
  const [voiceLanguage, setVoiceLanguageState] = useState<string>(
    () => localStorage.getItem('voiceLanguage') || 'en-US'
  )
  const [displayName, setDisplayNameState] = useState<string>('')
  const [customGreeting, setCustomGreetingState] = useState<string>('')
  const [loaded, setLoaded] = useState(false)

  const token = localStorage.getItem('token')

  // When accent changes
  useEffect(() => {
    applyFullTheme(accent, theme)
    localStorage.setItem('accent', accent)
  }, [accent, theme])

  // When theme changes
  useEffect(() => {
    applyFullTheme(accent, theme)
    localStorage.setItem('theme', theme)
  }, [theme, accent])

  // Voice language
  useEffect(() => {
    localStorage.setItem('voiceLanguage', voiceLanguage)
  }, [voiceLanguage])

  // Token-based effect to fetch user preferences
  useEffect(() => {
    if (!token) {
      setDisplayNameState('')
      setResponseStyleState('concise')
      setCustomGreetingState('')
      setLoaded(true)
      return
    }
    
    setLoaded(false)
    client.get('/api/user/preferences')
      .then(res => {
        setResponseStyleState(res.data.responseStyle)
        setDisplayNameState(res.data.displayName || '')
        setCustomGreetingState(res.data.customGreeting || '')
      })
      .catch(() => {
        // IF THE API FAILS, WE KEEP THE LOCALSTORAGE VALUES FOR ACCENT/THEME
        // We do NOT reset to default here.
        console.warn('Failed to load user preferences. Using local fallback.')
      })
      .finally(() => setLoaded(true))
  }, [token])

  const setAccent = (hex: string) => setAccentState(hex)
  const setTheme = (t: Theme) => setThemeState(t)
  const setVoiceLanguage = (lang: string) => setVoiceLanguageState(lang)

  const setResponseStyle = async (style: ResponseStyle) => {
    setResponseStyleState(style)
    await client.patch('/api/user/preferences', { responseStyle: style })
  }

  const setCustomGreeting = async (text: string) => {
    setCustomGreetingState(text)
    await client.patch('/api/user/preferences', { customGreeting: text })
  }

  const clearCustomGreeting = async () => {
    setCustomGreetingState('')
    await client.patch('/api/user/preferences', { customGreeting: '' })
  }

  const setDisplayName = async (name: string) => {
    setDisplayNameState(name)
    await client.patch('/api/user/preferences', { displayName: name })
  }

  const getSnapshot = (): SettingsSnapshot => ({ 
    accent, 
    responseStyle, 
    voiceLanguage, 
    displayName, 
    theme,
    customGreeting 
  })

  const restoreSnapshot = (s: SettingsSnapshot) => {
    setAccentState(s.accent)
    setResponseStyleState(s.responseStyle)
    setVoiceLanguageState(s.voiceLanguage)
    setDisplayNameState(s.displayName)
    setThemeState(s.theme)
    setCustomGreetingState(s.customGreeting)
  }

  return (
    <SettingsContext.Provider
      value={{
        accent, 
        setAccent,
        responseStyle, 
        setResponseStyle,
        voiceLanguage, 
        setVoiceLanguage,
        displayName, 
        setDisplayName,
        theme, 
        setTheme,
        customGreeting, 
        setCustomGreeting,
        clearCustomGreeting,
        getSnapshot, 
        restoreSnapshot,
        loaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export type { SettingsSnapshot }