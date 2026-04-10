import { CreateChatRoomPayload, UpdateChatRoomPayload, SendMessagePayload } from '../types/chat.types';
import { apiClient } from './apiClient';


// Uses the main apiClient (same backend — chat module is part of the same NestJS app)
// If you split chat into a separate service, swap to chatServiceApiClient

export const chatRoomService = {
  /** List all rooms the authenticated user belongs to */
  getAll: () => apiClient.get('/chat/rooms'),

  /** Get a single room by ID */
  getOne: (roomId: string) => apiClient.get(`/chat/rooms/${roomId}`),

  /** Get the project-linked room */
  getByProject: (projectId: string) =>
    apiClient.get(`/chat/rooms/project/${projectId}`),

  /** Create a new room */
  create: (data: CreateChatRoomPayload) => apiClient.post('/chat/rooms', data),

  /** Update room metadata */
  update: (roomId: string, data: UpdateChatRoomPayload) =>
    apiClient.patch(`/chat/rooms/${roomId}`, data),

  /** Add members */
  addMembers: (roomId: string, members: string[]) =>
    apiClient.post(`/chat/rooms/${roomId}/members`, { members }),

  /** Remove members */
  removeMembers: (roomId: string, members: string[]) =>
    apiClient.delete(`/chat/rooms/${roomId}/members`, { data: { members } }),

  /** Leave a room */
  leave: (roomId: string) => apiClient.delete(`/chat/rooms/${roomId}/leave`),

  /** Delete a room */
  delete: (roomId: string) => apiClient.delete(`/chat/rooms/${roomId}`),
};

export const messageService = {
  /** Fetch paginated message history — newest first */
  getMessages: (roomId: string, before?: string, limit = 30) =>
    apiClient.get(`/chat/messages/${roomId}`, {
      params: { ...(before ? { before } : {}), limit },
    }),

  /** Send a message via REST (WebSocket is preferred for real-time) */
  send: (data: SendMessagePayload) => apiClient.post('/chat/messages', data),

  /** Edit a message */
  edit: (messageId: string, text: string) =>
    apiClient.patch(`/chat/messages/${messageId}`, { text }),

  /** Soft-delete a message */
  delete: (messageId: string) =>
    apiClient.delete(`/chat/messages/${messageId}`),

  /** Toggle an emoji reaction */
  toggleReaction: (messageId: string, emoji: string) =>
    apiClient.post(`/chat/messages/${messageId}/reactions`, { emoji }),

  /** Mark all messages in a room as read */
  markAsRead: (roomId: string) =>
    apiClient.patch(`/chat/messages/rooms/${roomId}/read`),
};