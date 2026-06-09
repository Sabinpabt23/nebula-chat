/**
 * useSocket Hook
 * 
 * Manages the Socket.IO connection lifecycle and subscribes
 * to real-time events. Updates stores when events arrive.
 * Components use this hook to react to real-time data.
 * Only connects when the user is authenticated.
 */
import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { SOCKET_EVENTS } from '../lib/constants';
import { type Message } from '../types';

export function useSocket() {
    const { addMessage, setUnreadCounts } = useChatStore();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        const socket = connectSocket();

        socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message: Message) => {
            addMessage(message.conversationId, message);
        });

        socket.on(SOCKET_EVENTS.UNREAD_COUNT, (data: { counts: Array<{ conversationId: string; count: number }> }) => {
            if (data?.counts && Array.isArray(data.counts)) {
                setUnreadCounts(data.counts);
            }
        });

        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated, addMessage, setUnreadCounts]);

    return {
        joinConversation: (conversationId: string) => {
            getSocket()?.emit('join:conversation', { conversationId });
        },
        leaveConversation: (conversationId: string) => {
            getSocket()?.emit('leave:conversation', { conversationId });
        },
    };
}