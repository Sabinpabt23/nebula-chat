/**
 * Shared Types
 * 
 * TypeScript interfaces matching the backend entity shapes.
 * Single source of truth for all data structures used across the client.
 */

// ─── API Response Types ───────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message: string;
    timestamp: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// ─── User ─────────────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: string | null;
}

export interface UserProfile extends User {
    createdAt: string;
    tokenVersion: number;
}

// ─── Conversation ─────────────────────────────────────────────────

export interface Conversation {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name: string | null;
    avatarUrl: string | null;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    participants?: Participant[];
    lastMessage?: Message;
}

export interface Participant {
    conversationId: string;
    userId: string;
    role: 'ADMIN' | 'MEMBER';
    nickname: string | null;
    joinedAt: string;
    leftAt: string | null;
    user?: User;
}

// ─── Message ──────────────────────────────────────────────────────

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
    replyToId: string | null;
    isEdited: boolean;
    createdAt: string;
    sender?: User;
}

// ─── Auth ─────────────────────────────────────────────────────────

export interface AuthTokens {
    accessToken: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    code: string;
}

// ─── Socket Events ────────────────────────────────────────────────

export interface SocketUserStatus {
    userId: string;
    isOnline: boolean;
}

export interface SocketTypingEvent {
    userId: string;
    conversationId: string;
}

export interface SocketNewMessage {
    message: Message;
}

export interface SocketReadReceipt {
    messageId: string;
    userId: string;
    conversationId: string;
}

export interface SocketUnreadCount {
    conversationId: string;
    count: number;
}

export interface SocketNotification {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
}