import { useState, useEffect } from 'react'
import { PlusIcon, SliderIcon, LightbulbIcon, LanguagesIcon } from './Icons'
import { MarqueeText } from './MarqueeText'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ConfirmModal } from './ConfirmModal'
import { listConversations, renameConversation, deleteConversation, type Conversation, type ConvType } from '../api/conversations'
import { UserMenu } from './UserMenu' // <--- Keep this import

type Tab = 'home' | 'code'
type Tool = 'translator' | 'startup' | null

interface SidebarProps {
  activeTab: Tab
  setActiveTab: (t: Tab) => void
  open: boolean
  onClose: () => void
  isMobile: boolean
  width: number
  onStartResize: (e: React.MouseEvent) => void
  onOpenTranslator: () => void
  onOpenStartup: () => void
  onOpenCustomize: () => void
  activeConversationId: number | null
  onSelectConversation: (id: number) => void
  onNewChat: () => void
  refreshKey: number
  activeTool: Tool
}

export function Sidebar({
  activeTab, setActiveTab, open, onClose, isMobile, width, onStartResize,
  onOpenTranslator, onOpenStartup, onOpenCustomize,
  activeConversationId, onSelectConversation, onNewChat, refreshKey,
  activeTool,
}: SidebarProps) {
  const { username, logout } = useAuth()
  const toast = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [tappedId, setTappedId] = useState<number | null>(null)

  useEffect(() => {
    // Determine conversation type based on active tool or tab
    let type: ConvType = 'CHAT'
    if (activeTool === 'translator') {
      type = 'TRANSLATE'
    } else if (activeTab === 'code') {
      type = 'CODE'
    }
    listConversations(type).then(setConversations).catch(() => {})
  }, [refreshKey, activeTab, activeTool])

  const startRename = (c: Conversation) => {
    setEditingId(c.id)
    setEditValue(c.title)
  }

  const commitRename = async (id: number) => {
    const title = editValue.trim()
    setEditingId(null)
    if (!title) return
    try {
      const updated = await renameConversation(id, title)
      setConversations(prev => prev.map(c => (c.id === id ? updated : c)))
      toast.success('Renamed')
    } catch {
      toast.error('Failed to rename')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (activeConversationId === id) onNewChat()
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  // Get the appropriate section title
  const getSectionTitle = () => {
    if (activeTool === 'translator') return 'Translations'
    if (activeTab === 'code') return 'Code Sessions'
    return 'Chats'
  }

  // Get the new chat label
  const getNewChatLabel = () => {
    if (activeTool === 'translator') return 'New translation'
    if (activeTab === 'code') return 'New code session'
    return 'New chat'
  }

  const content = (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <div className="flex gap-1 flex-1 rounded-lg p-0.5" style={{ background: 'var(--bg-surface)' }}>
          {(['home', 'code'] as Tab[]).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors duration-150"
              style={{
                background: activeTab === t ? 'var(--accent)' : 'transparent',
                color: activeTab === t ? '#fff' : 'var(--text-tertiary)',
              }}>
              {t === 'home' ? 'Home' : 'Code'}
            </button>
          ))}
        </div>
        {isMobile && <button onClick={onClose} className="p-1.5 transition-colors" style={{ color: 'var(--text-tertiary)' }}>✕</button>}
      </div>

      <nav className="px-2 flex flex-col gap-0.5">
        <SidebarItem 
          icon={<PlusIcon />} 
          label={getNewChatLabel()} 
          primary 
          onClick={onNewChat} 
        />
        <SidebarItem 
          icon={<LightbulbIcon />} 
          label="Startup Idea Generator" 
          active={activeTool === 'startup'} 
          onClick={onOpenStartup} 
        />
        <SidebarItem 
          icon={<LanguagesIcon />} 
          label="AI Translator" 
          active={activeTool === 'translator'} 
          onClick={onOpenTranslator} 
        />
        <SidebarItem 
          icon={<SliderIcon />} 
          label="Customize" 
          onClick={onOpenCustomize} 
        />
      </nav>

      <div className="mx-3 my-3 h-px" style={{ background: 'var(--border-subtle)' }} />

      <div className="px-2 flex-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
          {getSectionTitle()}
        </p>
        {conversations.map(c => {
          const isTapped = tappedId === c.id
          return (
            <div
              key={c.id}
              className="group flex items-center gap-1 px-1 py-0.5 rounded-lg relative"
              style={{ background: activeConversationId === c.id ? 'var(--bg-surface)' : 'transparent' }}
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitRename(c.id)}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(c.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="flex-1 px-2 py-2 text-xs rounded-md outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
                />
              ) : (
                <>
                  <button
                    onClick={() => onSelectConversation(c.id)}
                    className="flex-1 min-w-0 text-left px-2 py-2 rounded-lg text-xs transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <MarqueeText text={c.title} />
                  </button>

                  {isMobile ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setTappedId(prev => (prev === c.id ? null : c.id)) }}
                      className="p-1.5 text-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      ⋮
                    </button>
                  ) : (
                    <>
                      <button onClick={() => startRename(c)}
                        className="p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--text-tertiary)' }}>
                        ✎
                      </button>
                      <button onClick={() => setPendingDeleteId(c.id)}
                        className="p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                        style={{ color: 'var(--text-tertiary)' }}>
                        ✕
                      </button>
                    </>
                  )}

                  {isMobile && isTapped && (
                    <div className="absolute right-2 mt-9 z-10 flex gap-1 rounded-lg p-1 shadow-lg" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)' }}>
                      <button onClick={() => { startRename(c); setTappedId(null) }} className="px-2 py-1.5 text-xs rounded-md" style={{ color: 'var(--text-secondary)' }}>Rename</button>
                      <button onClick={() => { setPendingDeleteId(c.id); setTappedId(null) }} className="px-2 py-1.5 text-xs rounded-md text-red-400">Delete</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* --- REPLACED USER FOOTER WITH USER MENU --- */}
      <div className="px-2 pt-2 pb-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <UserMenu  />
      </div>
    </div>
  )

  const sidebarBody = isMobile ? (
    <>
      {open && <div className="fixed inset-0 z-40" style={{ background: 'var(--overlay)' }} onClick={onClose} />}
      <div className="fixed top-0 left-0 h-full z-50 transition-transform duration-300 w-[280px]"
        style={{ transform: open ? 'translateX(0)' : 'translateX(-100%)', borderRight: '1px solid var(--border-subtle)' }}>
        {content}
      </div>
    </>
  ) : (
    <>
      <div className="h-full flex-shrink-0 overflow-hidden" style={{ width: open ? width : 0 }}>
        {open && content}
      </div>
      {open && (
        <div
          onMouseDown={onStartResize}
          className="h-full w-1 cursor-col-resize transition-colors flex-shrink-0 bg-[var(--border-subtle)] hover:bg-[color-mix(in_srgb,var(--accent)_55%,transparent)]"
        />
      )}
    </>
  )

  return (
    <>
      {sidebarBody}
      <ConfirmModal
        open={pendingDeleteId !== null}
        title="Delete conversation?"
        message="This will permanently delete this conversation and all its messages. This can't be undone."
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => { if (pendingDeleteId) handleDelete(pendingDeleteId); setPendingDeleteId(null) }}
      />
    </>
  )
}

function SidebarItem({ icon, label, primary, active, onClick }: {
  icon: React.ReactNode; label: string; primary?: boolean; active?: boolean; onClick?: () => void
}) {
  const style: React.CSSProperties = primary
    ? { background: 'var(--accent)', color: '#fff' }
    : active
    ? {
        background: 'color-mix(in srgb, var(--accent) 16%, transparent)',
        color: 'var(--accent)',
        border: '1px solid color-mix(in srgb, var(--accent) 35%, transparent)',
      }
    : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' }

  return (
    <button onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
      style={style}
      onMouseEnter={e => { if (!primary && !active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)' }}
      onMouseLeave={e => { if (!primary && !active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
      {icon}
      {label}
    </button>
  )
}