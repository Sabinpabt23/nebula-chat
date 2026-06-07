/**
 * Notification Service
 * 
 * Business logic for user notifications and unread message tracking.
 * Computes unread counts per conversation by combining conversation,
 * participant, and message receipt data.
 * 
 * Also delivers real-time notifications to users and conversation rooms.
 */
import { MessageReceiptRepository } from '../repositories/MessageReceiptRepository';
import { ParticipantRepository } from '../repositories/ParticipantRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { SocketManager } from '../socket/SocketManager';
import { SOCKET_EVENTS } from '../utils/constants.util';

export class NotificationService {
    constructor(
        private readonly messageReceiptRepository: MessageReceiptRepository,
        private readonly participantRepository: ParticipantRepository,
        private readonly conversationRepository: ConversationRepository,
    ) {}

    async getUnreadCounts(userId: string): Promise<{ conversationId: string; count: number }[]> {
        const conversations = await this.conversationRepository.findByUserId(userId);
        const results: { conversationId: string; count: number }[] = [];

        for (const conversation of conversations) {
            const participant = conversation.participants?.find((p) => p.userId === userId);
            const lastReadMessageId = participant?.lastReadMessageId ?? null;

            const count = await this.messageReceiptRepository.getUnreadCount(
                conversation.id,
                userId,
                lastReadMessageId,
            );

            results.push({ conversationId: conversation.id, count });
        }

        return results;
    }

    async getConversationUnreadCount(conversationId: string, userId: string): Promise<number> {
        const participant = await this.participantRepository.findParticipant(conversationId, userId);
        const lastReadMessageId = participant?.lastReadMessageId ?? null;

        return this.messageReceiptRepository.getUnreadCount(
            conversationId,
            userId,
            lastReadMessageId,
        );
    }

    async notifyUser(userId: string, notification: {
        type: string;
        title: string;
        message: string;
        data?: Record<string, unknown>;
    }): Promise<void> {
        const socketManager = SocketManager.getInstance();
        socketManager.sendToUser(userId, SOCKET_EVENTS.NOTIFICATION, notification);
    }

    async notifyConversation(
        conversationId: string,
        excludeUserId: string,
        notification: { type: string; title: string; message: string; data?: Record<string, unknown> },
    ): Promise<void> {
        const participantIds = await this.participantRepository.getParticipantIds(conversationId);
        const socketManager = SocketManager.getInstance();

        for (const participantId of participantIds) {
            if (participantId !== excludeUserId) {
                socketManager.sendToUser(participantId, SOCKET_EVENTS.NOTIFICATION, notification);
            }
        }
    }
}