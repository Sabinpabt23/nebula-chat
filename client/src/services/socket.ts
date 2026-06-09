/**
 * Socket Service
 *
 * Manages the Socket.IO client connection.
 * Provides a singleton socket instance with automatic auth token attachment
 * and connection state tracking.
 *
 * Components never call socket.emit() directly — they use hooks.
 */
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket(): Socket {
    if (socket?.connected) {
        return socket;
    }

    // If a stale disconnected instance exists, clean it up before creating a new one.
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }

    const token = getAccessToken();

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
    });

    return socket;
}

/**
 * Updates the auth token on the existing socket and forces a reconnect.
 * Called by useAuth after a successful token refresh so the server
 * re-authenticates the socket without creating a new instance.
 */
export function reconnectWithToken(token: string): void {
    if (!socket) return;
    socket.auth = { token };
    socket.disconnect().connect();
}

export function disconnectSocket(): void {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
}

export function getSocket(): Socket | null {
    return socket;
}