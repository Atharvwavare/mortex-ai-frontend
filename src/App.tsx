import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import { SplashScreen } from './components/SplashScreen'
import { SignInScreen } from './components/SignInScreen'
import { Sidebar } from './components/Sidebar'
import { HomeChat } from './components/HomeChat'
import { CodeOptimizer } from './components/CodeOptimizer'
import { Translator } from './components/Translator'
import { StartupIdea } from './components/StartupIdea'
import { CustomizeModal } from './components/CustomizeModal'

type Screen = 'splash' | 'signin' | 'app'
type Tab = 'home' | 'code'
type Tool = 'translator' | 'startup' | null

const MIN_WIDTH = 240
const MAX_WIDTH = 420

function AppInner() {
  const { token } = useAuth()
  const [screen, setScreen] = useState<Screen>(token ? 'app' : 'splash')
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [activeChatId, setActiveChatId] = useState<number | null>(null)
  const [activeCodeId, setActiveCodeId] = useState<number | null>(null)
  const [activeTranslateId, setActiveTranslateId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(272)
  const [isMobile, setIsMobile] = useState(true)
  const [activeTool, setActiveTool] = useState<Tool>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const dragging = useRef(false)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile && screen === 'app') setSidebarOpen(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [screen])

  useEffect(() => {
    if (!token) { setScreen('splash'); setActiveTool(null) }
  }, [token])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = 'col-resize'
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setSidebarWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX)))
    }
    const stop = () => { dragging.current = false; document.body.style.cursor = '' }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', stop)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', stop) }
  }, [])

  const handleNewChat = () => {
    if (activeTab === 'code') setActiveCodeId(null)
    else setActiveChatId(null)
    setActiveTool(null)
  }

  const handleChatCreated = (id: number) => { setActiveChatId(id); setRefreshKey(k => k + 1) }
  const handleCodeCreated = (id: number) => { setActiveCodeId(id); setRefreshKey(k => k + 1) }
  const handleTranslateCreated = (id: number) => { setActiveTranslateId(id); setRefreshKey(k => k + 1) }

  const handleHistoryCleared = () => {
    setActiveChatId(null)
    setActiveCodeId(null)
    setActiveTranslateId(null)
    setRefreshKey(k => k + 1)
  }

  if (screen === 'splash') return <SplashScreen onNext={() => setScreen('signin')} />
  if (screen === 'signin') return <SignInScreen onNext={() => { setScreen('app'); setSidebarOpen(window.innerWidth >= 768) }} />

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={t => { setActiveTab(t); setActiveTool(null); if (isMobile) setSidebarOpen(false) }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
        width={sidebarWidth}
        onStartResize={startResize}
        onOpenTranslator={() => { setActiveTool('translator'); if (isMobile) setSidebarOpen(false) }}
        onOpenStartup={() => { setActiveTool('startup'); if (isMobile) setSidebarOpen(false) }}
        onOpenCustomize={() => setCustomizeOpen(true)}
        activeConversationId={
          activeTool === 'translator' ? activeTranslateId :
          activeTab === 'code' ? activeCodeId : activeChatId
        }
        onSelectConversation={id => {
          if (activeTool === 'translator') setActiveTranslateId(id)
          else if (activeTab === 'code') setActiveCodeId(id)
          else setActiveChatId(id)
        }}
        onNewChat={handleNewChat}
        refreshKey={refreshKey}
        activeTool={activeTool}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 transition-colors" style={{ color: 'var(--text-tertiary)' }}>☰</button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTool === 'translator' && (
            <Translator
              onBack={() => setActiveTool(null)}
              conversationId={activeTranslateId}
              onConversationCreated={handleTranslateCreated}
              onActivity={() => setRefreshKey(k => k + 1)}
            />
          )}
          {activeTool === 'startup' && <StartupIdea onBack={() => setActiveTool(null)} />}
          {!activeTool && activeTab === 'home' && (
            <HomeChat
              conversationId={activeChatId}
              onConversationCreated={handleChatCreated}
              onActivity={() => setRefreshKey(k => k + 1)}
            />
          )}
          {!activeTool && activeTab === 'code' && (
            <CodeOptimizer
              conversationId={activeCodeId}
              onConversationCreated={handleCodeCreated}
              onActivity={() => setRefreshKey(k => k + 1)}
            />
          )}
        </div>
      </div>

      <CustomizeModal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        onHistoryCleared={handleHistoryCleared}
      />
    </div>
  )
}

export default function App() {
  return (
    <AppInner />
  )
}