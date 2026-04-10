import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { fetchAuthSession } from '@aws-amplify/auth';
import { Message, TypingEvent, RoomReadEvent } from '../types/chat.types';


const SOCKET_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';

interface UseChatSocketOptions {
  onNewMessage?: (msg: Message) => void;
  onMessageEdited?: (msg: Message) => void;
  onMessageDeleted?: (payload: { messageId: string; roomId: string }) => void;
  onReactionUpdated?: (msg: Message) => void;
  onUserTyping?: (evt: TypingEvent) => void;
  onUserStopTyping?: (evt: TypingEvent) => void;
  onRoomRead?: (evt: RoomReadEvent) => void;
  onError?: (err: { message: string }) => void;
}

export function useChatSocket(options: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options; // always use latest callbacks without re-connecting

  // Connect once on mount
  useEffect(() => {
    let socket: Socket;

    const connect = async () => {
      let token = '';
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.idToken?.toString() ?? '';
      } catch {
        console.warn('[chat socket] could not get auth token');
      }

      socket = io(`${SOCKET_URL}/chat`, {
        auth: {token},
        transports: ['websocket'],
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
      });

      socket.on('connect', () =>
        console.log('[chat socket] connected:', socket.id),
      );
      socket.on('disconnect', (reason) =>
        console.log('[chat socket] disconnected:', reason),
      );

      socket.on('new_message', (msg: Message) =>
        optionsRef.current.onNewMessage?.(msg),
      );
      socket.on('message_edited', (msg: Message) =>
        optionsRef.current.onMessageEdited?.(msg),
      );
      socket.on('message_deleted', (payload) =>
        optionsRef.current.onMessageDeleted?.(payload),
      );
      socket.on('reaction_updated', (msg: Message) =>
        optionsRef.current.onReactionUpdated?.(msg),
      );
      socket.on('user_typing', (evt: TypingEvent) =>
        optionsRef.current.onUserTyping?.(evt),
      );
      socket.on('user_stop_typing', (evt: TypingEvent) =>
        optionsRef.current.onUserStopTyping?.(evt),
      );
      socket.on('room_read', (evt: RoomReadEvent) =>
        optionsRef.current.onRoomRead?.(evt),
      );
      socket.on('error', (err: { message: string }) =>
        optionsRef.current.onError?.(err),
      );

      socketRef.current = socket;
    };

    connect();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []); // connect once

  const joinRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('join_room', { roomId });
  }, []);

  const leaveRoom = useCallback((roomId: string) => {
    socketRef.current?.emit('leave_room', { roomId });
  }, []);

  const sendMessage = useCallback(
    (payload: {
      roomId: string;
      text?: string;
      replyToMessageId?: string;
    }) => {
      socketRef.current?.emit('send_message', payload);
    },
    [],
  );

  const editMessage = useCallback(
    (messageId: string, text: string) => {
      socketRef.current?.emit('edit_message', { messageId, text });
    },
    [],
  );

  const deleteMessage = useCallback((messageId: string) => {
    socketRef.current?.emit('delete_message', { messageId });
  }, []);

  const toggleReaction = useCallback((messageId: string, emoji: string) => {
    socketRef.current?.emit('react', { messageId, emoji });
  }, []);

  const emitTyping = useCallback((roomId: string) => {
    socketRef.current?.emit('typing', { roomId });
  }, []);

  const emitStopTyping = useCallback((roomId: string) => {
    socketRef.current?.emit('stop_typing', { roomId });
  }, []);

  const markRead = useCallback((roomId: string) => {
    socketRef.current?.emit('mark_read', { roomId });
  }, []);

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    emitTyping,
    emitStopTyping,
    markRead,
  };
}