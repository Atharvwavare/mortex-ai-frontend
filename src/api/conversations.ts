import client from './client'

export interface Conversation {
  id: number
  title: string
  updatedAt: string
}

export interface StoredMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
}

// Add 'TRANSLATE' to the ConvType
export type ConvType = 'CHAT' | 'CODE' | 'TRANSLATE'

export const listConversations = (type: ConvType = 'CHAT') =>
  client.get<Conversation[]>('/api/conversations', { params: { type } }).then(r => r.data)

export const createConversation = (type: ConvType = 'CHAT') =>
  client.post<Conversation>('/api/conversations', null, { params: { type } }).then(r => r.data)

export const renameConversation = (id: number, title: string) =>
  client.patch<Conversation>(`/api/conversations/${id}`, { title }).then(r => r.data)

export const deleteConversation = (id: number) =>
  client.delete(`/api/conversations/${id}`)

export const getConversationMessages = (id: number) =>
  client.get<StoredMessage[]>(`/api/conversations/${id}/messages`).then(r => r.data)

export const editMessage = (conversationId: number, messageId: number, content: string) =>
  client.post<{ reply: string }>(`/api/conversations/${conversationId}/messages/${messageId}/edit`, { content })