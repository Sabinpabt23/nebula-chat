/**
 * useSocket Hook
 * 
 * Manages the Socket.IO connection lifecycle and subscribes
 * to real-time events. Updates stores when events arrive.
 * Components use this hook to react to real-time data.
 */
import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useChatStore } from '../stores/chatStore';
import { SOCKET_EVENTS } from '../lib/constants';
import { type SocketUserStatus, type SocketNewMessage, type SocketTypingEvent, type SocketUnreadCount } from '../types';

export function useSocket() {
    const { addMessage, updateUnreadCount, setUnreadCounts } = useChatStore();

    useEffect(() => {
        const socket = connectSocket();

        socket.on(SOCKET_EVENTS.MESSAGE_NEW, (data: SocketNewMessage) => {
            addMessage(data.message.conversationId, data.message);
        });

        socket.on(SOCKET_EVENTS.USER_ONLINE, (data: SocketUserStatus) => {
            console.log('[Socket] User online:', data.userId);
        });

        socket.on(SOCKET_EVENTS.USER_OFFLINE, (data: SocketUserStatus) => {
            console.log('[Socket] User offline:', data.userId);
        });

        socket.on(SOCKET_EVENTS.TYPING_START, (data: SocketTypingEvent) => {
            console.log('[Socket] Typing:', data.userId);
        });

        socket.on(SOCKET_EVENTS.TYPING_STOP, (data: SocketTypingEvent) => {
            console.log('[Socket] Stopped typing:', data.userId);
        });

        socket.on(SOCKET_EVENTS.UNREAD_COUNT, (data: { counts: SocketUnreadCount[] }) => {
            setUnreadCounts(data.counts);
        });

        socket.on(SOCKET_EVENTS.ERROR, (error: { message: string }) => {
            console.error('[Socket] Error:', error.message);
        });

        return () => {
            disconnectSocket();
        };
    }, [addMessage, updateUnreadCount, setUnreadCounts]);

    return {
        joinConversation: (conversationId: string) => {
            getSocket()?.emit('join:conversation', { conversationId });
        },
        leaveConversation: (conversationId: string) => {
            getSocket()?.emit('leave:conversation', { conversationId });
        },
        emitTypingStart: (conversationId: string) => {
            getSocket()?.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
        },
        emitTypingStop: (conversationId: string) => {
            getSocket()?.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
        },
    };
}