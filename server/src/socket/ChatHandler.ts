/**
 * Chat Socket Handler
 * 
 * Handles real-time chat events via Socket.IO.
 * Processes incoming messages, typing indicators, and read receipts,
 * then broadcasts to the appropriate conversation rooms.
 * 
 * Events handled:
 * - message:send — Persist message and broadcast to room
 * - typing:start / typing:stop — Broadcast typing status
 * - message:read — Mark as read and notify sender
 */
import { Server, Socket } from 'socket.io';
import { MessageService } from '../services/MessageService';
import { SOCKET_EVENTS } from '../utils/constants.util';
import { logger } from '../utils/logger.util';

export class ChatHandler {
    constructor(private readonly messageService: MessageService) {}

    register(io: Server): void {
        io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
            this.handleMessageSend(socket);
            this.handleTyping(socket);
            this.handleReadReceipt(socket);
        });
    }

    private handleMessageSend(socket: Socket): void {
        socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (data: {
            conversationId: string;
            content: string;
            messageType?: 'TEXT' | 'IMAGE' | 'FILE';
        }) => {
            try {
                const senderId = socket.data.userId;
                const message = await this.messageService.sendMessage(
                    senderId,
                    data.conversationId,
                    data.content,
                    data.messageType || 'TEXT',
                );

                logger.info(`Message sent by ${senderId} in conversation ${data.conversationId}`);
            } catch (error: any) {
                socket.emit(SOCKET_EVENTS.ERROR, {
                    message: error.message || 'Failed to send message',
                });
            }
        });
    }

   private handleTyping(socket: Socket): void {
    socket.on(SOCKET_EVENTS.TYPING_START, (data: { conversationId: string }) => {
        console.log('Typing:', socket.data.userId, 'in', data.conversationId);
        socket.to(`conversation:${data.conversationId}`).emit(SOCKET_EVENTS.TYPING_START, {
            userId: socket.data.userId,
            conversationId: data.conversationId,
        });
    });

        socket.on(SOCKET_EVENTS.TYPING_STOP, (data: { conversationId: string }) => {
            socket.to(`conversation:${data.conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP, {
                userId: socket.data.userId,
                conversationId: data.conversationId,
            });
        });
    }

    private handleReadReceipt(socket: Socket): void {
        socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data: {
            conversationId: string;
            messageId: string;
        }) => {
            try {
                const userId = socket.data.userId;
                await this.messageService.markAsRead(data.messageId, userId);

                socket.to(`conversation:${data.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
                    messageId: data.messageId,
                    userId,
                    conversationId: data.conversationId,
                });
            } catch (error: any) {
                socket.emit(SOCKET_EVENTS.ERROR, {
                    message: error.message || 'Failed to mark message as read',
                });
            }
        });
    }
}