/**
 * Presence Handler
 * 
 * Manages user online/offline status updates.
 * Updates the user's isOnline and lastSeenAt fields in the database
 * when users connect and disconnect from Socket.IO.
 * 
 * Used by SocketManager to persist presence state beyond just WebSocket connections.
 */
import { UserRepository } from '../repositories/UserRepository';
import { logger } from '../utils/logger.util';

export class PresenceHandler {
    constructor(private readonly userRepository: UserRepository) {}

    async setUserOnline(userId: string): Promise<void> {
        await this.userRepository.update(userId, {
            isOnline: true,
            lastSeenAt: new Date(),
        } as any);
        logger.debug(`User ${userId} is now online`);
    }

    async setUserOffline(userId: string): Promise<void> {
        await this.userRepository.update(userId, {
            isOnline: false,
            lastSeenAt: new Date(),
        } as any);
        logger.debug(`User ${userId} is now offline`);
    }
}