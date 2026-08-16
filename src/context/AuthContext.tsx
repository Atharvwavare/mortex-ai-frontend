import { createContext, useContext, useState, type ReactNode } from 'react'
import client from '../api/client'

interface AuthContextType {
  token: string | null
  username: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'))

  const saveSession = (t: string, u: string) => {
    localStorage.setItem('token', t)
    localStorage.setItem('username', u)
    setToken(t)
    setUsername(u)
  }

  const login = async (username: string, password: string) => {
    const res = await client.post('/api/auth/login', { username, password })
    saveSession(res.data.token, res.data.username)
  }

  const register = async (username: string, email: string, password: string) => {
    const res = await client.post('/api/auth/register', { username, email, password })
    saveSession(res.data.token, res.data.username)
  }

  const loginWithGoogle = async (idToken: string) => {
    const res = await client.post('/api/auth/google', { idToken })
    saveSession(res.data.token, res.data.username)
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ token, username, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}