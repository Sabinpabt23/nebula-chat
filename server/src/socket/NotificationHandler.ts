/**
 * Notification Socket Handler
 * 
 * Handles real-time notification events via Socket.IO.
 * Broadcasts unread count updates and system notifications
 * to connected users.
 */
import { Server } from 'socket.io';
import { NotificationService } from '../services/NotificationService';
import { SOCKET_EVENTS } from '../utils/constants.util';
import { logger } from '../utils/logger.util';

export class NotificationHandler {
    constructor(private readonly notificationService: NotificationService) {}

    register(io: Server): void {
        io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
            const userId = socket.data.userId;

            this.sendUnreadCounts(socket, userId);

            socket.on('request:unread', async () => {
                await this.sendUnreadCounts(socket, userId);
            });
        });
    }

    private async sendUnreadCounts(socket: any, userId: string): Promise<void> {
        try {
            const counts = await this.notificationService.getUnreadCounts(userId);
            socket.emit(SOCKET_EVENTS.UNREAD_COUNT, { counts });
        } catch (error: any) {
            logger.error(`Failed to send unread counts to user ${userId}`, error);
        }
    }
}