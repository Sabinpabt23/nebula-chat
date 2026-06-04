export enum ConversationType {
    DIRECT = 'DIRECT',
    GROUP = 'GROUP',
}

export enum ParticipantRole {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
}

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    FILE = 'FILE',
    SYSTEM = 'SYSTEM',
}

export enum OtpPurpose {
    LOGIN = 'LOGIN',
    VERIFY_EMAIL = 'VERIFY_EMAIL',
}

export enum TokenType {
    ACCESS = 'ACCESS',
    REFRESH = 'REFRESH',
}

export const SOCKET_EVENTS = {
    // Connection
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',

    // User Presence
    USER_ONLINE: 'user:online',
    USER_OFFLINE: 'user:offline',

    // Conversations
    JOIN_CONVERSATION: 'join:conversation',
    LEAVE_CONVERSATION: 'leave:conversation',
    CONVERSATION_UPDATED: 'conversation:updated',

    // Messages
    MESSAGE_SEND: 'message:send',
    MESSAGE_NEW: 'message:new',
    MESSAGE_READ: 'message:read',
    MESSAGE_UPDATED: 'message:updated',
    MESSAGE_DELETED: 'message:deleted',

    // Typing
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',

    // Notifications
    NOTIFICATION: 'notification',
    UNREAD_COUNT: 'unread:count',

    // Errors
    ERROR: 'error',
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

export const OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_MINUTES: 10,
    MAX_ATTEMPTS: 3,
    RESEND_COOLDOWN_SECONDS: 60,
} as const;

export const USER_STATUS = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    AWAY: 'away',
} as const;