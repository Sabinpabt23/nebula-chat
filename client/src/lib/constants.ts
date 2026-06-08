/**
 * Client Constants
 * 
 * Pure values used across the client. No logic, no imports from other modules.
 * Mirrors the backend's constants.util.ts approach.
 */

export const ROUTES = {
    LOGIN: '/login',
    CHAT: '/chat',
    PROFILE: '/profile',
} as const;


export const SOCKET_EVENTS = {
    // Connection
    JOIN_CONVERSATION: 'join:conversation',
    LEAVE_CONVERSATION: 'leave:conversation',

    // Messages (outgoing)
    MESSAGE_SEND: 'message:send',

    // Messages (incoming)
    MESSAGE_NEW: 'message:new',
    MESSAGE_READ: 'message:read',

    // Typing
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',

    // Status
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',

    // Notifications
    NOTIFICATION: 'notification',
    UNREAD_COUNT: 'unread:count',

    // Errors
    ERROR: 'error',
} as const;

export const MESSAGE_TYPES = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
    FILE: 'FILE',
    SYSTEM: 'SYSTEM',
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
} as const;