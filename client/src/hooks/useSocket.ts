/**
 * useSocket Hook
 *
 * Manages the Socket.IO connection lifecycle and subscribes
 * to real-time events. Updates stores when events arrive.
 * Components use this hook to react to real-time data.
 * Only connects when the user is authenticated.
 *
 * The socket is a singleton tied to the auth session — it is NOT
 * disconnected when a component unmounts. It is only disconnected
 * when the user explicitly logs out (isAuthenticated → false).
 */
import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { SOCKET_EVENTS } from '../lib/constants';
import { type Message } from '../types';

export function useSocket() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Pull store actions once — these are stable references from Zustand.
    const addMessage = useChatStore((state) => state.addMessage);
    const setUnreadCounts = useChatStore((state) => state.setUnreadCounts);

    // Track which conversation room we're currently in so we can
    // re-join it automatically if the socket reconnects mid-session.
    const activeRoomRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            // User logged out — tear down the socket.
            disconnectSocket();
            activeRoomRef.current = null;
            return;
        }

        const socket = connectSocket();

        // ── Event listeners ──────────────────────────────────────────────

        function onMessageNew(message: Message) {
            addMessage(message.conversationId, message);
        }

        function onUnreadCount(data: {
            counts: Array<{ conversationId: string; count: number }>;
        }) {
            if (data?.counts && Array.isArray(data.counts)) {
                setUnreadCounts(data.counts);
            }
        }

        // On reconnect, re-join the active conversation room so messages
        // keep arriving without requiring a manual page reload.
        function onReconnect() {
            if (activeRoomRef.current) {
                socket.emit('join:conversation', {
                    conversationId: activeRoomRef.current,
                });
            }
        }

        socket.on(SOCKET_EVENTS.MESSAGE_NEW, onMessageNew);
        socket.on(SOCKET_EVENTS.UNREAD_COUNT, onUnreadCount);
        socket.io.on('reconnect', onReconnect);

        // ── Cleanup ───────────────────────────────────────────────────────
        // Remove only the listeners this effect attached.
        // Do NOT disconnect the socket — it must survive component re-renders.
        return () => {
            socket.off(SOCKET_EVENTS.MESSAGE_NEW, onMessageNew);
            socket.off(SOCKET_EVENTS.UNREAD_COUNT, onUnreadCount);
            socket.io.off('reconnect', onReconnect);
        };
    }, [isAuthenticated, addMessage, setUnreadCounts]);

    return {
    joinConversation: (conversationId: string) => {
        activeRoomRef.current = conversationId;
        getSocket()?.emit('join:conversation', conversationId);
    },
    leaveConversation: (conversationId: string) => {
        if (activeRoomRef.current === conversationId) {
            activeRoomRef.current = null;
        }
        getSocket()?.emit('leave:conversation', conversationId);
    },
};
}