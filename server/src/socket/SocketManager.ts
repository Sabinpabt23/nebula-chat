/**
 * Socket Manager (Singleton)
 * * Centralized WebSocket connection manager using Socket.IO.
 * Maintains a map of userId → Set<socketId> for multi-device support.
 * Provides methods to send events to specific users or conversation rooms.
 * * Responsibilities:
 * - Initialize Socket.IO server with JWT authentication middleware
 * - Track user connections (register, remove, check online status)
 * - Send targeted messages to users or conversation rooms
 * - Broadcast presence updates
 * * Pattern: Singleton — only one instance exists across the application
 */
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { jwtUtil } from '../utils/jwt.util';
import { logger } from '../utils/logger.util';
import { env } from '../config/env.config';
import { SOCKET_EVENTS } from '../utils/constants.util';
import { PresenceHandler } from './PresenceHandler';
import { UserRepository } from '../repositories/UserRepository';
import { ChatHandler } from './ChatHandler';
import { MessageService } from '../services/MessageService';
import { MessageRepository } from '../repositories/MessageRepository';
import { MessageReceiptRepository } from '../repositories/MessageReceiptRepository';
import { ParticipantRepository } from '../repositories/ParticipantRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';

export class SocketManager {
    private static instance: SocketManager;
    private readonly io: Server;
    private readonly userSockets: Map<string, Set<string>>;
    private readonly presenceHandler: PresenceHandler;

    private constructor(server: HttpServer) {
        this.userSockets = new Map();
        
        const userRepository = new UserRepository();
        this.presenceHandler = new PresenceHandler(userRepository);

        this.io = new Server(server, {
            cors: {
                origin: env.cors.origin,
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        this.setupAuthentication();
        this.setupConnectionHandlers();

        // Register chat handler
        const messageRepo = new MessageRepository();
        const receiptRepo = new MessageReceiptRepository();
        const participantRepo = new ParticipantRepository();
        const conversationRepo = new ConversationRepository();
        
        const messageService = new MessageService(
            messageRepo, 
            receiptRepo, 
            participantRepo, 
            conversationRepo
        );
        
        const chatHandler = new ChatHandler(messageService);
        chatHandler.register(this.io);
    }

    static getInstance(server?: HttpServer): SocketManager {
        if (!SocketManager.instance && server) {
            SocketManager.instance = new SocketManager(server);
        }
        if (!SocketManager.instance) {
            throw new Error('SocketManager not initialized. Call getInstance with a server first.');
        }
        return SocketManager.instance;
    }

    private setupAuthentication(): void {
        this.io.use(async (socket: Socket, next) => {
            try {
                const token = socket.handshake.auth.token as string;

                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const payload = jwtUtil.verifyAccessToken(token);
                socket.data.userId = payload.userId;
                socket.data.email = payload.email;
                next();
            } catch {
                next(new Error('Invalid or expired token'));
            }
        });
    }

    private setupConnectionHandlers(): void {
        this.io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
            const userId = socket.data.userId;
            
            this.registerUser(userId, socket.id);
            this.presenceHandler.setUserOnline(userId);
            
            logger.info(`User ${userId} connected. Socket: ${socket.id}`);

            this.broadcastUserStatus(userId, true);

            socket.on(SOCKET_EVENTS.DISCONNECT, () => {
                this.removeUserSocket(userId, socket.id);
                logger.info(`User ${userId} disconnected. Socket: ${socket.id}`);

                if (!this.isUserOnline(userId)) {
                    this.presenceHandler.setUserOffline(userId);
                    this.broadcastUserStatus(userId, false);
                }
            });

            socket.on(SOCKET_EVENTS.JOIN_CONVERSATION, (conversationId: string) => {
                const room = `conversation:${conversationId}`;
                socket.join(room);
                logger.info(`User ${userId} joined room ${room}`);
            });

            socket.on(SOCKET_EVENTS.LEAVE_CONVERSATION, (conversationId: string) => {
                const room = `conversation:${conversationId}`;
                socket.leave(room);
                logger.info(`User ${userId} left room ${room}`);
            });
        });
    }

    registerUser(userId: string, socketId: string): void {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socketId);
    }

    removeUserSocket(userId: string, socketId: string): void {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.delete(socketId);
            if (sockets.size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }

    isUserOnline(userId: string): boolean {
        const sockets = this.userSockets.get(userId);
        return sockets !== undefined && sockets.size > 0;
    }

    sendToUser(userId: string, event: string, data: unknown): void {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            sockets.forEach((socketId) => {
                this.io.to(socketId).emit(event, data);
            });
        }
    }

    sendToConversation(conversationId: string, event: string, data: unknown): void {
        const room = `conversation:${conversationId}`;
        this.io.to(room).emit(event, data);
    }

    broadcastUserStatus(userId: string, isOnline: boolean): void {
        this.io.emit(isOnline ? SOCKET_EVENTS.USER_ONLINE : SOCKET_EVENTS.USER_OFFLINE, {
            userId,
            isOnline,
        });
    }

    getIO(): Server {
        return this.io;
    }

    getConnectedUsers(): string[] {
        return Array.from(this.userSockets.keys());
    }
}