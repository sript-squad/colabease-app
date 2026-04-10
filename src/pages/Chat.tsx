import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, Badge, Skeleton, Tooltip, CircularProgress } from '@mui/material';
import {
  Hash, Lock, Users, Plus, Search, Send,
  Edit3, Trash2, SmilePlus, Reply, MoreHorizontal,
  Check, X, ChevronDown, MessageSquare, UserPlus,
} from 'lucide-react';
import { chatRoomService, messageService } from '../services/chatService';
import { useChatSocket } from '../services/useChatSocket';
import { useAuth } from '../auth/authContex';
import { ChatRoom, Message } from '../types/chat.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉', '🔥'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function getRoomDisplayName(room: ChatRoom, currentEmail: string): string {
  if (room.type === 'direct') {
    const other = room.members.find((m) => m !== currentEmail);
    return other?.split('@')[0] ?? 'Direct Message';
  }
  return room.name || 'Unnamed Room';
}

function getInitials(email: string) {
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(email: string): string {
  const colors = ['#3B6D11', '#1A2E0F', '#639922', '#557A1B', '#7A9E3A', '#4A8015'];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const RoomAvatar = ({ room, currentEmail, size = 36 }: { room: ChatRoom; currentEmail: string; size?: number }) => {
  if (room.type === 'direct') {
    const other = room.members.find((m) => m !== currentEmail) ?? '';
    return (
      <Avatar sx={{ width: size, height: size, bgcolor: getAvatarColor(other), fontSize: size * 0.35 }}>
        {getInitials(other)}
      </Avatar>
    );
  }
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: room.type === 'project' ? '#1A2E0F' : '#3B6D11', fontSize: size * 0.35 }}>
      {room.type === 'project' ? '#' : (room.name?.[0] ?? 'G').toUpperCase()}
    </Avatar>
  );
};

const DateDivider = ({ label }: { label: string }) => (
  <div style={styles.dateDivider}>
    <div style={styles.dateLine} />
    <span style={styles.dateLabel}>{label}</span>
    <div style={styles.dateLine} />
  </div>
);

const TypingIndicator = ({ users }: { users: string[] }) => {
  if (!users.length) return null;
  const names = users.map((u) => u.split('@')[0]).join(', ');
  return (
    <div style={styles.typingBar}>
      <div style={styles.typingDots}>
        <span style={{ ...styles.dot, animationDelay: '0ms' }} />
        <span style={{ ...styles.dot, animationDelay: '160ms' }} />
        <span style={{ ...styles.dot, animationDelay: '320ms' }} />
      </div>
      <span style={styles.typingText}>
        {names} {users.length === 1 ? 'is' : 'are'} typing…
      </span>
    </div>
  );
};

const MessageBubble = ({
  msg,
  isOwn,
  onReact,
  onEdit,
  onDelete,
  onReply,
  currentEmail,
}: {
  msg: Message;
  isOwn: boolean;
  onReact: (id: string, emoji: string) => void;
  onEdit: (msg: Message) => void;
  onDelete: (id: string) => void;
  onReply: (msg: Message) => void;
  currentEmail: string;
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (msg.isDeleted) {
    return (
      <div style={{ ...styles.msgRow, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
        <span style={styles.deletedMsg}>This message was deleted</span>
      </div>
    );
  }

  return (
    <div
      style={{ ...styles.msgRow, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojiPicker(false); }}
    >
      {!isOwn && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: getAvatarColor(msg.senderEmail), fontSize: 11, flexShrink: 0, alignSelf: 'flex-end', mb: '2px' }}>
          {getInitials(msg.senderEmail)}
        </Avatar>
      )}

      <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: 2 }}>
        {!isOwn && <span style={styles.senderName}>{msg.senderEmail.split('@')[0]}</span>}

        <div style={{ position: 'relative' }}>
          {/* Floating action bar */}
          {showActions && (
            <div style={{ ...styles.actionBar, [isOwn ? 'right' : 'left']: 'calc(100% + 6px)' }}>
              <Tooltip title="Reply">
                <button style={styles.actionBtn} onClick={() => onReply(msg)}><Reply size={13} /></button>
              </Tooltip>
              <Tooltip title="React">
                <button style={styles.actionBtn} onClick={() => setShowEmojiPicker((p) => !p)}><SmilePlus size={13} /></button>
              </Tooltip>
              {isOwn && (
                <>
                  <Tooltip title="Edit">
                    <button style={styles.actionBtn} onClick={() => onEdit(msg)}><Edit3 size={13} /></button>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <button style={{ ...styles.actionBtn, color: '#993C1D' }} onClick={() => onDelete(msg._id)}><Trash2 size={13} /></button>
                  </Tooltip>
                </>
              )}
              {showEmojiPicker && (
                <div style={{ ...styles.emojiPicker, [isOwn ? 'right' : 'left']: 0 }}>
                  {QUICK_EMOJIS.map((e) => (
                    <button key={e} style={styles.emojiBtn} onClick={() => { onReact(msg._id, e); setShowEmojiPicker(false); }}>{e}</button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ ...styles.bubble, ...(isOwn ? styles.bubbleOwn : styles.bubbleOther) }}>
            {msg.text && <p style={styles.msgText}>{msg.text}</p>}
            {msg.attachments?.map((att, i) => (
              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" style={styles.attachmentLink}>
                📎 {att.fileName}
              </a>
            ))}
            <div style={styles.msgMeta}>
              <span style={{ ...styles.msgTime, color: isOwn ? 'rgba(255,255,255,0.65)' : '#9cb69c' }}>
                {formatTime(msg.createdAt)}
                {msg.editedAt && ' · edited'}
              </span>
              {isOwn && (
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10 }}>
                  {msg.readBy.length > 1 ? <Check size={12} /> : null}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Reactions */}
        {msg.reactions?.length > 0 && (
          <div style={styles.reactionsRow}>
            {msg.reactions.map((r) => (
              <button
                key={r.emoji}
                style={{
                  ...styles.reactionChip,
                  ...(r.reactedBy.includes(currentEmail) ? styles.reactionChipActive : {}),
                }}
                onClick={() => onReact(msg._id, r.emoji)}
              >
                {r.emoji} <span style={{ fontSize: 10 }}>{r.reactedBy.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── New Room Modal ───────────────────────────────────────────────────────────

const NewRoomModal = ({
  onClose,
  onCreated,
  currentEmail,
}: {
  onClose: () => void;
  onCreated: (room: ChatRoom) => void;
  currentEmail: string;
}) => {
  const [type, setType] = useState<'direct' | 'group'>('direct');
  const [name, setName] = useState('');
  const [membersInput, setMembersInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const members = membersInput.split(',').map((m) => m.trim()).filter(Boolean);
    if (!members.length) { setError('Enter at least one member email'); return; }
    if (type === 'group' && !name.trim()) { setError('Group name is required'); return; }

    try {
      setLoading(true);
      setError('');
      const res = await chatRoomService.create({ type, name: name || undefined, members });
      onCreated(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>New Conversation</h3>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Type toggle */}
        <div style={styles.typeToggle}>
          {(['direct', 'group'] as const).map((t) => (
            <button
              key={t}
              style={{ ...styles.typeBtn, ...(type === t ? styles.typeBtnActive : {}) }}
              onClick={() => setType(t)}
            >
              {t === 'direct' ? <Lock size={13} /> : <Users size={13} />}
              {t === 'direct' ? 'Direct Message' : 'Group Chat'}
            </button>
          ))}
        </div>

        {type === 'group' && (
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Group Name</label>
            <input
              style={styles.input}
              placeholder="e.g. Design Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            {type === 'direct' ? 'Member Email' : 'Member Emails (comma separated)'}
          </label>
          <input
            style={styles.input}
            placeholder="alice@example.com, bob@example.com"
            value={membersInput}
            onChange={(e) => setMembersInput(e.target.value)}
          />
        </div>

        {error && <p style={styles.errorText}>{error}</p>}

        <button style={styles.createBtn} onClick={handleCreate} disabled={loading}>
          {loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Create'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Chat Page ───────────────────────────────────────────────────────────

const ChatPage = () => {
  const { user } = useAuth();
  const currentEmail = user?.email ?? '';

  // ─ State ──────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMsg, setEditingMsg] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [roomSearch, setRoomSearch] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRoomRef = useRef<string | null>(null);

  // ─ Socket ─────────────────────────────────────────────────────────
  const socket = useChatSocket({
    onNewMessage: useCallback((msg: Message) => {
      if (msg.roomId === activeRoom?._id) {
        setMessages((prev) => [...prev, msg]);
        socket.markRead(msg.roomId);
      } else {
        setUnreadCounts((prev) => ({ ...prev, [msg.roomId]: (prev[msg.roomId] ?? 0) + 1 }));
      }
      // Update room last message preview
      setRooms((prev) =>
        prev
          .map((r) =>
            r._id === msg.roomId
              ? { ...r, lastMessageText: msg.text ?? '📎 Attachment', lastMessageAt: msg.createdAt, lastMessageBy: msg.senderEmail }
              : r,
          )
          .sort((a, b) => new Date(b.lastMessageAt ?? b.createdAt).getTime() - new Date(a.lastMessageAt ?? a.createdAt).getTime()),
      );
    }, [activeRoom]),

    onMessageEdited: useCallback((msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    }, []),

    onMessageDeleted: useCallback(({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, isDeleted: true, text: undefined } : m)),
      );
    }, []),

    onReactionUpdated: useCallback((msg: Message) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    }, []),

    onUserTyping: useCallback(({ userEmail, roomId }: { userEmail: string; roomId: string }) => {
      if (roomId !== activeRoom?._id) return;
      setTypingUsers((prev) => (prev.includes(userEmail) ? prev : [...prev, userEmail]));
    }, [activeRoom]),

    onUserStopTyping: useCallback(({ userEmail }: { userEmail: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== userEmail));
    }, []),

    onRoomRead: useCallback(({ roomId, userEmail: reader }: { roomId: string; userEmail: string }) => {
      if (reader !== currentEmail) return;
      setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
    }, [currentEmail]),
  });

  // ─ Data loading ───────────────────────────────────────────────────
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await chatRoomService.getAll();
        setRooms(res.data);
        if (res.data.length > 0) setActiveRoom(res.data[0]);
      } catch (e) {
        console.error('Failed to load rooms', e);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, []);

  // Join/leave socket rooms and load messages when active room changes
  useEffect(() => {
    if (!activeRoom) return;

    if (prevRoomRef.current && prevRoomRef.current !== activeRoom._id) {
      socket.leaveRoom(prevRoomRef.current);
    }
    prevRoomRef.current = activeRoom._id;
    socket.joinRoom(activeRoom._id);
    setTypingUsers([]);

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await messageService.getMessages(activeRoom._id);
        const sorted = [...res.data].reverse(); // API returns newest-first, we want oldest-first
        setMessages(sorted);
        setHasMore(res.data.length === 30);
        // Mark as read
        socket.markRead(activeRoom._id);
        setUnreadCounts((prev) => ({ ...prev, [activeRoom._id]: 0 }));
      } catch (e) {
        console.error('Failed to load messages', e);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [activeRoom?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─ Load older messages ────────────────────────────────────────────
  const loadOlderMessages = async () => {
    if (!activeRoom || !hasMore || messages.length === 0) return;
    const oldest = messages[0];
    const res = await messageService.getMessages(activeRoom._id, oldest.createdAt);
    const older = [...res.data].reverse();
    setMessages((prev) => [...older, ...prev]);
    setHasMore(res.data.length === 30);
  };

  // ─ Send message ───────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim() || !activeRoom) return;
    socket.sendMessage({
      roomId: activeRoom._id,
      text: input.trim(),
      replyToMessageId: replyTo?._id,
    });
    setInput('');
    setReplyTo(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emitStopTyping(activeRoom._id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─ Typing indicator ───────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!activeRoom) return;
    socket.emitTyping(activeRoom._id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.emitStopTyping(activeRoom._id), 2000);
  };

  // ─ Edit message ───────────────────────────────────────────────────
  const handleEditSave = () => {
    if (!editingMsg || !editText.trim()) return;
    socket.editMessage(editingMsg._id, editText.trim());
    setEditingMsg(null);
    setEditText('');
  };

  // ─ Delete ─────────────────────────────────────────────────────────
  const handleDelete = (messageId: string) => {
    socket.deleteMessage(messageId);
  };

  // ─ Reactions ─────────────────────────────────────────────────────
  const handleReact = (messageId: string, emoji: string) => {
    socket.toggleReaction(messageId, emoji);
  };

  // ─ Date grouping ─────────────────────────────────────────────────
  const groupedMessages = (() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    messages.forEach((msg) => {
      const d = formatDate(msg.createdAt);
      if (d !== currentDate) {
        groups.push({ date: d, messages: [msg] });
        currentDate = d;
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    return groups;
  })();

  const filteredRooms = rooms.filter((r) =>
    getRoomDisplayName(r, currentEmail).toLowerCase().includes(roomSearch.toLowerCase()),
  );

  // ─ Render ─────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <style>{keyframes}</style>

      {/* ── Sidebar ── */}
      <div style={styles.sidebar}>
        {/* Sidebar header */}
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarTitle}>
            <MessageSquare size={18} color="#3B6D11" />
            <span style={styles.sidebarTitleText}>Messages</span>
          </div>
          <Tooltip title="New Conversation">
            <button style={styles.newRoomBtn} onClick={() => setShowNewRoom(true)}>
              <Plus size={16} />
            </button>
          </Tooltip>
        </div>

        {/* Search */}
        <div style={styles.searchWrapper}>
          <Search size={14} color="#9cb69c" style={{ flexShrink: 0 }} />
          <input
            style={styles.searchInput}
            placeholder="Search conversations…"
            value={roomSearch}
            onChange={(e) => setRoomSearch(e.target.value)}
          />
        </div>

        {/* Room list */}
        <div style={styles.roomList}>
          {loadingRooms ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ padding: '8px 12px' }}>
                <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 2 }} />
              </div>
            ))
          ) : filteredRooms.length === 0 ? (
            <div style={styles.emptyRooms}>
              <MessageSquare size={28} color="#d0e4c8" />
              <p style={{ fontSize: 13, color: '#9cb69c', margin: '8px 0 0 0', textAlign: 'center' }}>
                No conversations yet.
                <br />Start one with the + button.
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const isActive = activeRoom?._id === room._id;
              const unread = unreadCounts[room._id] ?? 0;
              const displayName = getRoomDisplayName(room, currentEmail);
              return (
                <button
                  key={room._id}
                  style={{ ...styles.roomItem, ...(isActive ? styles.roomItemActive : {}) }}
                  onClick={() => setActiveRoom(room)}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <RoomAvatar room={room} currentEmail={currentEmail} size={38} />
                    {room.type === 'direct' && (
                      <span style={styles.onlineDot} />
                    )}
                  </div>
                  <div style={styles.roomInfo}>
                    <div style={styles.roomNameRow}>
                      <span style={{ ...styles.roomName, fontWeight: unread > 0 ? 700 : 500 }}>
                        {displayName}
                      </span>
                      <span style={styles.roomTime}>
                        {room.lastMessageAt ? formatTime(room.lastMessageAt) : ''}
                      </span>
                    </div>
                    <div style={styles.roomPreviewRow}>
                      <span style={{ ...styles.roomPreview, fontWeight: unread > 0 ? 600 : 400, color: unread > 0 ? '#3B6D11' : '#9cb69c' }}>
                        {room.lastMessageText ?? (room.type === 'group' ? `${room.members.length} members` : 'Start chatting')}
                      </span>
                      {unread > 0 && (
                        <Badge
                          badgeContent={unread}
                          color="error"
                          sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 16, minWidth: 16 } }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Main chat area ── */}
      {activeRoom ? (
        <div style={styles.chatArea}>
          {/* Chat header */}
          <div style={styles.chatHeader}>
            <div style={styles.chatHeaderLeft}>
              <RoomAvatar room={activeRoom} currentEmail={currentEmail} size={38} />
              <div>
                <div style={styles.chatRoomName}>
                  {activeRoom.type === 'project' && <Hash size={14} style={{ color: '#3B6D11' }} />}
                  {activeRoom.type === 'direct' && <Lock size={13} style={{ color: '#9cb69c' }} />}
                  {getRoomDisplayName(activeRoom, currentEmail)}
                </div>
                <div style={styles.chatRoomMeta}>
                  {activeRoom.type === 'direct'
                    ? activeRoom.members.find((m) => m !== currentEmail)
                    : `${activeRoom.members.length} members`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Tooltip title="Members">
                <button style={styles.headerIconBtn}>
                  <UserPlus size={16} />
                </button>
              </Tooltip>
              <Tooltip title="More">
                <button style={styles.headerIconBtn}>
                  <MoreHorizontal size={16} />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messagesArea} ref={messagesContainerRef}>
            {hasMore && (
              <div style={{ textAlign: 'center', paddingTop: 12 }}>
                <button style={styles.loadMoreBtn} onClick={loadOlderMessages}>
                  <ChevronDown size={14} /> Load earlier messages
                </button>
              </div>
            )}

            {loadingMessages ? (
              <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="rectangular" width={220} height={52} sx={{ borderRadius: '16px' }} />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div style={styles.emptyChat}>
                <div style={styles.emptyChatIcon}>
                  <MessageSquare size={32} color="#d0e4c8" />
                </div>
                <p style={{ color: '#9cb69c', fontSize: 14, margin: 0 }}>
                  No messages yet. Say hello! 👋
                </p>
              </div>
            ) : (
              groupedMessages.map((group) => (
                <div key={group.date}>
                  <DateDivider label={group.date} />
                  {group.messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      isOwn={msg.senderEmail === currentEmail}
                      onReact={handleReact}
                      onEdit={(m) => { setEditingMsg(m); setEditText(m.text ?? ''); }}
                      onDelete={handleDelete}
                      onReply={setReplyTo}
                      currentEmail={currentEmail}
                    />
                  ))}
                </div>
              ))
            )}
            <TypingIndicator users={typingUsers.filter((u) => u !== currentEmail)} />
            <div ref={messagesEndRef} />
          </div>

          {/* Reply preview */}
          {replyTo && (
            <div style={styles.replyBar}>
              <Reply size={13} color="#3B6D11" />
              <span style={styles.replyText}>
                Replying to <strong>{replyTo.senderEmail.split('@')[0]}</strong>:{' '}
                {replyTo.text?.slice(0, 60)}
                {(replyTo.text?.length ?? 0) > 60 ? '…' : ''}
              </span>
              <button style={styles.closeBtn} onClick={() => setReplyTo(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Edit bar */}
          {editingMsg && (
            <div style={styles.editBar}>
              <Edit3 size={13} color="#3B6D11" />
              <input
                style={styles.editInput}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') { setEditingMsg(null); setEditText(''); } }}
                autoFocus
              />
              <button style={styles.saveEditBtn} onClick={handleEditSave}><Check size={14} /></button>
              <button style={styles.closeBtn} onClick={() => { setEditingMsg(null); setEditText(''); }}><X size={14} /></button>
            </div>
          )}

          {/* Input bar */}
          {!editingMsg && (
            <div style={styles.inputBar}>
              <input
                style={styles.messageInput}
                placeholder={`Message ${getRoomDisplayName(activeRoom, currentEmail)}…`}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              <button
                style={{ ...styles.sendBtn, opacity: input.trim() ? 1 : 0.4 }}
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <MessageSquare size={48} color="#d0e4c8" />
          <h3 style={{ color: '#1A2E0F', margin: '16px 0 8px' }}>Your Messages</h3>
          <p style={{ color: '#9cb69c', fontSize: 14, maxWidth: 260, textAlign: 'center', margin: 0 }}>
            Select a conversation or start a new one using the + button.
          </p>
          <button style={styles.startBtn} onClick={() => setShowNewRoom(true)}>
            <Plus size={16} /> New Conversation
          </button>
        </div>
      )}

      {/* New room modal */}
      {showNewRoom && (
        <NewRoomModal
          onClose={() => setShowNewRoom(false)}
          currentEmail={currentEmail}
          onCreated={(room) => {
            setRooms((prev) => {
              const exists = prev.find((r) => r._id === room._id);
              return exists ? prev : [room, ...prev];
            });
            setActiveRoom(room);
            setShowNewRoom(false);
          }}
        />
      )}
    </div>
  );
};

// ─── Animations ───────────────────────────────────────────────────────────────

const keyframes = `
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    background: '#F8FAF7',
    overflow: 'hidden',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.04)',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },

  // ── Sidebar ──
  sidebar: {
    width: 300,
    minWidth: 300,
    background: '#fff',
    borderRight: '1px solid rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 16px 12px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  sidebarTitle: { display: 'flex', alignItems: 'center', gap: 8 },
  sidebarTitleText: { fontSize: 16, fontWeight: 700, color: '#1A2E0F' },
  newRoomBtn: {
    background: 'rgba(59,109,17,0.08)',
    border: 'none',
    borderRadius: 8,
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#3B6D11',
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '10px 12px',
    background: '#F8FAF7',
    borderRadius: 10,
    padding: '7px 12px',
    border: '1px solid rgba(0,0,0,0.06)',
  },
  searchInput: {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 13,
    color: '#1A2E0F',
    width: '100%',
  },
  roomList: { flex: 1, overflowY: 'auto', padding: '4px 0' },
  emptyRooms: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px 24px',
    gap: 4,
  },
  roomItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 12px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
    position: 'relative',
  },
  roomItemActive: {
    background: 'rgba(59,109,17,0.08)',
    borderRadius: 0,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: '50%',
    background: '#52a447',
    border: '2px solid #fff',
  },
  roomInfo: { flex: 1, minWidth: 0 },
  roomNameRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 },
  roomName: { fontSize: 14, color: '#1A2E0F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 },
  roomTime: { fontSize: 10, color: '#9cb69c', whiteSpace: 'nowrap', flexShrink: 0 },
  roomPreviewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  roomPreview: { fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 },

  // ── Chat area ──
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: '#F8FAF7',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: '#fff',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  chatRoomName: { fontSize: 15, fontWeight: 700, color: '#1A2E0F', display: 'flex', alignItems: 'center', gap: 5 },
  chatRoomMeta: { fontSize: 12, color: '#9cb69c', marginTop: 1 },
  headerIconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9cb69c',
    padding: '6px 8px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  emptyChat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '60px 20px',
  },
  emptyChatIcon: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#F0F7EA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreBtn: {
    background: 'none',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: '5px 16px',
    fontSize: 12,
    color: '#3B6D11',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },

  // ── Messages ──
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: 8, paddingTop: 6, animation: 'fadeIn 0.2s ease' },
  senderName: { fontSize: 11, color: '#9cb69c', fontWeight: 600, paddingLeft: 2, marginBottom: 2 },
  bubble: {
    padding: '9px 14px',
    borderRadius: 18,
    maxWidth: '100%',
    wordBreak: 'break-word',
    position: 'relative',
  },
  bubbleOwn: {
    background: 'linear-gradient(135deg, #3B6D11, #639922)',
    borderBottomRightRadius: 4,
    color: '#fff',
  },
  bubbleOther: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.06)',
    borderBottomLeftRadius: 4,
    color: '#1A2E0F',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  msgText: { margin: 0, fontSize: 14, lineHeight: 1.5 },
  msgMeta: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: 'flex-end' },
  msgTime: { fontSize: 10 },
  deletedMsg: { fontSize: 13, color: '#9cb69c', fontStyle: 'italic', padding: '6px 12px' },
  attachmentLink: { display: 'block', fontSize: 13, color: 'inherit', textDecoration: 'underline', marginTop: 4 },

  // Floating action bar
  actionBar: {
    position: 'absolute',
    top: -36,
    display: 'flex',
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    zIndex: 10,
    padding: 2,
    gap: 1,
    whiteSpace: 'nowrap',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#7a9e7a',
    padding: '4px 7px',
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
  },
  emojiPicker: {
    position: 'absolute',
    top: -52,
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 12,
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    padding: '6px 8px',
    display: 'flex',
    gap: 2,
    zIndex: 20,
  },
  emojiBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 18,
    padding: '2px 4px',
    borderRadius: 6,
  },
  reactionsRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  reactionChip: {
    background: '#F8FAF7',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: '2px 7px',
    cursor: 'pointer',
    fontSize: 13,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  },
  reactionChipActive: {
    background: 'rgba(59,109,17,0.1)',
    border: '1px solid rgba(59,109,17,0.3)',
  },

  // ── Date divider ──
  dateDivider: { display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 10px' },
  dateLine: { flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' },
  dateLabel: { fontSize: 11, color: '#9cb69c', fontWeight: 600, whiteSpace: 'nowrap' },

  // ── Typing ──
  typingBar: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px', minHeight: 22 },
  typingDots: { display: 'flex', gap: 3, alignItems: 'center' },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#9cb69c',
    display: 'inline-block',
    animation: 'bounce 1.2s infinite ease-in-out',
  },
  typingText: { fontSize: 12, color: '#9cb69c', fontStyle: 'italic' },

  // ── Reply/Edit bars ──
  replyBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 20px',
    background: '#F0F7EA',
    borderTop: '1px solid rgba(59,109,17,0.12)',
    fontSize: 13,
    color: '#1A2E0F',
  },
  replyText: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  editBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: '#F0F7EA',
    borderTop: '1px solid rgba(59,109,17,0.12)',
  },
  editInput: {
    flex: 1,
    border: '1px solid rgba(59,109,17,0.3)',
    borderRadius: 10,
    padding: '6px 12px',
    fontSize: 14,
    outline: 'none',
    background: '#fff',
    color: '#1A2E0F',
  },
  saveEditBtn: {
    background: '#3B6D11',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    padding: '5px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },

  // ── Input ──
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 20px',
    background: '#fff',
    borderTop: '1px solid rgba(0,0,0,0.05)',
  },
  messageInput: {
    flex: 1,
    border: '1.5px solid rgba(0,0,0,0.1)',
    borderRadius: 14,
    padding: '10px 16px',
    fontSize: 14,
    outline: 'none',
    background: '#F8FAF7',
    color: '#1A2E0F',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #3B6D11, #639922)',
    border: 'none',
    borderRadius: 12,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(59,109,17,0.25)',
    transition: 'opacity 0.2s',
  },

  // ── Empty state ──
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    background: '#F8FAF7',
  },
  startBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'linear-gradient(135deg, #3B6D11, #639922)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 12,
    boxShadow: '0 4px 12px rgba(59,109,17,0.2)',
  },

  // ── Modal ──
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1400,
  },
  modal: {
    background: '#fff',
    borderRadius: 20,
    padding: 28,
    width: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#1A2E0F' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9cb69c', display: 'flex', alignItems: 'center', padding: 4 },
  typeToggle: { display: 'flex', gap: 8 },
  typeBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '9px 12px',
    border: '1.5px solid rgba(0,0,0,0.1)',
    borderRadius: 10,
    background: '#F8FAF7',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#7a9e7a',
  },
  typeBtnActive: {
    background: 'rgba(59,109,17,0.08)',
    border: '1.5px solid #3B6D11',
    color: '#3B6D11',
    fontWeight: 600,
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#7a9e7a', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    border: '1.5px solid rgba(0,0,0,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    color: '#1A2E0F',
    background: '#F8FAF7',
  },
  errorText: { color: '#993C1D', fontSize: 13, margin: 0 },
  createBtn: {
    background: 'linear-gradient(135deg, #3B6D11, #639922)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '12px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59,109,17,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
};

export default ChatPage;