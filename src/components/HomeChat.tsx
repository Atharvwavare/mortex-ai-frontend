import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageList } from './MessageList'
import client from '../api/client'
import { createConversation, getConversationMessages, editMessage, type StoredMessage } from '../api/conversations'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useToast } from '../context/ToastContext'
import { MicButton } from './MicButton'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { ChatSkeleton, MessageSkeleton } from './Skeleton'

interface HomeChatProps {
  conversationId: number | null
  onConversationCreated: (id: number) => void
  onActivity: () => void
  onNewChat?: () => void
}

export function HomeChat({ conversationId, onConversationCreated, onActivity, onNewChat }: HomeChatProps) {
  const [messages, setMessages] = useState<StoredMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  // Scroll to bottom when messages or loading state changes
  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) 
  }, [messages, loading])

  // Load messages when conversation changes
  useEffect(() => {
    setIsLoadingInitial(true)
    if (conversationId) {
      getConversationMessages(conversationId)
        .then(setMessages)
        .catch(() => setMessages([]))
        .finally(() => setIsLoadingInitial(false))
    } else {
      setMessages([])
      setIsLoadingInitial(false)
    }
  }, [conversationId])

  // Global Escape key handler for canceling edit
  useEffect(() => {
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingId) {
        cancelEdit()
      }
    }
    
    document.addEventListener('keydown', handleGlobalEsc)
    return () => document.removeEventListener('keydown', handleGlobalEsc)
  }, [editingId])

  const handleSpeechResult = useCallback((text: string) => {
    setInput(prev => (prev ? prev + ' ' + text : text))
  }, [])

  const { listening, supported, levels, start, stop } = useSpeechRecognition(
    handleSpeechResult, 
    (msg) => toast.error(msg)
  )

  const autoResize = () => {
    const el = textRef.current
    if (el) { 
      el.style.height = 'auto' 
      el.style.height = Math.min(el.scrollHeight, 200) + 'px' 
    }
  }

  const refresh = useCallback(async (id: number) => {
    const msgs = await getConversationMessages(id)
    setMessages(msgs)
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    let convId = conversationId
    if (!convId) {
      const created = await createConversation()
      convId = created.id
      onConversationCreated(convId)
    }

    setInput('')
    if (textRef.current) textRef.current.style.height = 'auto'
    setLoading(true)
    try {
      await client.post('/api/chat', { conversationId: convId, message: text })
      await refresh(convId)
      onActivity()
    } catch (err) {
      console.error(err)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = useCallback(async (message: StoredMessage) => {
    if (!conversationId) return
    
    setLoading(true)
    try {
      // Delete the message and get the previous message to regenerate
      await client.delete(`/api/chat/${conversationId}/messages/${message.id}`)
      await refresh(conversationId)
      toast.success('Regenerating response...')
    } catch (err) {
      console.error(err)
      toast.error('Failed to regenerate')
    } finally {
      setLoading(false)
    }
  }, [conversationId, refresh, toast])

  const startEdit = useCallback((msg: StoredMessage) => {
    setEditingId(msg.id)
    setEditValue(msg.content)
  }, [])

  const cancelEdit = useCallback(() => setEditingId(null), [])

  const saveEdit = useCallback(async (msg: StoredMessage) => {
    const newContent = editValue.trim()
    setEditingId(null)
    if (!conversationId || !newContent || newContent === msg.content) return
    setLoading(true)
    try {
      await editMessage(conversationId, msg.id, newContent)
      await refresh(conversationId)
      onActivity()
    } catch {
      toast.error('Failed to regenerate response')
    } finally {
      setLoading(false)
    }
  }, [conversationId, editValue, refresh, onActivity, toast])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrl: true,
      action: () => {
        if (input.trim() && !loading) {
          sendMessage()
        }
      },
      description: 'Send message'
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        if (onNewChat) {
          onNewChat()
        }
      },
      description: 'New chat'
    },
    {
      key: 'k',
      ctrl: true,
      action: () => {
        const toggleButton = document.querySelector('[data-shortcuts-toggle]') as HTMLButtonElement
        if (toggleButton) {
          toggleButton.click()
        }
      },
      description: 'Toggle shortcuts help'
    },
    {
      key: 'Escape',
      action: () => {
        if (editingId) {
          cancelEdit()
        }
      },
      description: 'Cancel editing'
    }
  ])

  // Show loading skeleton
  if (isLoadingInitial) {
    return <ChatSkeleton />
  }

  return (
    <div className="h-full flex flex-col">
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <MessageList
            messages={messages}
            loading={loading}
            editingId={editingId}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            onSaveEdit={saveEdit}
            bottomRef={bottomRef}
          />
          {/* Show skeleton while loading more messages */}
          {loading && messages.length > 0 && <MessageSkeleton />}
        </div>
      </div>

      <div className="flex-shrink-0 px-6 pb-6 pt-2">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl p-4 flex flex-col gap-2 shadow-xl" style={{ 
            background: 'var(--bg-surface)', 
            border: '1px solid var(--border-default)' 
          }}>
            <textarea
              ref={textRef}
              value={input}
              onChange={e => { 
                setInput(e.target.value)
                autoResize() 
              }}
              onKeyDown={e => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault()
                  sendMessage() 
                }
              }}
              placeholder={listening ? 'Listening...' : 'Message Mortex AI... (Ctrl+Enter to send)'}
              rows={2}
              className="w-full resize-none bg-transparent outline-none text-[15px] leading-relaxed px-1 min-h-[52px]"
              style={{ color: 'var(--text-primary)' }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Keyboard shortcut hint */}
                <span className="text-[10px] opacity-50" style={{ color: 'var(--text-tertiary)' }}>
                  {input.trim() ? 'Ctrl+Enter to send' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {supported && (
                  <MicButton 
                    listening={listening} 
                    levels={levels} 
                    onClick={listening ? stop : start} 
                  />
                )}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 disabled:opacity-40"
                  style={{ 
                    background: input.trim() ? 'var(--accent)' : 'var(--bg-surface)', 
                    color: input.trim() ? '#fff' : 'var(--text-tertiary)' 
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.894 15.553a1 1 0 01-.03-1.039l3.2-6.4L2.863 1.71A1 1 0 013.993.1l14 7a1 1 0 010 1.8l-14 7a1 1 0 01-1.099-.347z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] mt-2" style={{ color: 'var(--text-faint)' }}>
            Mortex AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}