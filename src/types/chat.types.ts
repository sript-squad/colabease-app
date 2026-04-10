// ─── Room ────────────────────────────────────────────────────────────────────

export type ChatRoomType = 'direct' | 'group' | 'project';

export interface ChatRoom {
  _id: string;
  type: ChatRoomType;
  name?: string;
  description?: string;
  members: string[];         // user emails
  createdBy: string;
  projectId?: string;
  isArchived: boolean;
  lastMessageText?: string;
  lastMessageAt?: string;
  lastMessageBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatRoomPayload {
  type: ChatRoomType;
  name?: string;
  description?: string;
  members: string[];
  projectId?: string;
}

export interface UpdateChatRoomPayload {
  name?: string;
  description?: string;
  isArchived?: boolean;
}

// ─── Message ─────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'file' | 'image' | 'system';

export interface Attachment {
  url: string;
  fileName: string;
  mimeType?: string;
  size?: number;
}

export interface Reaction {
  emoji: string;
  reactedBy: string[];
}

export interface Message {
  _id: string;
  roomId: string;
  senderEmail: string;
  type: MessageType;
  text?: string;
  attachments: Attachment[];
  reactions: Reaction[];
  editedAt?: string;
  isDeleted: boolean;
  replyToMessageId?: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  roomId: string;
  text?: string;
  type?: MessageType;
  attachments?: Attachment[];
  replyToMessageId?: string;
}

// ─── Socket events ────────────────────────────────────────────────────────────

export interface TypingEvent {
  roomId: string;
  userEmail: string;
}

export interface RoomReadEvent {
  roomId: string;
  userEmail: string;
  updatedCount: number;
}