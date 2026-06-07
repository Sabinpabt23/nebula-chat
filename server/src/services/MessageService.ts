/**
 * Message Service
 * 
 * Business logic for message handling.
 * Persists messages, manages read receipts, and provides
 * paginated message history for conversations.
 * 
 * Rules:
 * - Only conversation members can send messages
 * - Only conversation members can read messages
 * - Messages are ordered by creation time (newest first for history)
 */
import { MessageRepository } from '../repositories/MessageRepository';
import { MessageReceiptRepository } from '../repositories/MessageReceiptRepository';
import { ParticipantRepository } from '../repositories/ParticipantRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { Message } from '../entities/Message';
import { ForbiddenException } from '../exceptions/index';
import { SocketManager } from '../socket/SocketManager';
import { SOCKET_EVENTS } from '../utils/constants.util';

export class MessageService {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly messageReceiptRepository: MessageReceiptRepository,
        private readonly participantRepository: ParticipantRepository,
        private readonly conversationRepository: ConversationRepository,
    ) {}

    async sendMessage(
        senderId: string,
        conversationId: string,
        content: string,
        messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
    ): Promise<Message> {
        const isMember = await this.participantRepository.isMember(conversationId, senderId);

        if (!isMember) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        const message = await this.messageRepository.createMessage({
            conversationId,
            senderId,
            content,
            messageType,
        });

        await this.conversationRepository.update(conversationId, {
            updatedAt: new Date(),
        } as any);

        const populatedMessage = await this.messageRepository.findByIdOrFail(message.id);

        const socketManager = SocketManager.getInstance();
        socketManager.sendToConversation(conversationId, SOCKET_EVENTS.MESSAGE_NEW, populatedMessage);

        const participantIds = await this.participantRepository.getParticipantIds(conversationId);
        for (const participantId of participantIds) {
            if (participantId !== senderId) {
                const unreadCount = await this.messageReceiptRepository.getUnreadCount(
                    conversationId,
                    participantId,
                    null
                );
                socketManager.sendToUser(participantId, SOCKET_EVENTS.UNREAD_COUNT, {
                    conversationId,
                    count: unreadCount,
                });
            }
        }

        return populatedMessage;
    }

    async getMessages(
        conversationId: string,
        userId: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: Message[]; total: number }> {
        const isMember = await this.participantRepository.isMember(conversationId, userId);

        if (!isMember) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        return this.messageRepository.findByConversation(conversationId, page, limit);
    }

    async markAsRead(messageId: string, userId: string): Promise<void> {
        await this.messageReceiptRepository.markAsRead(messageId, userId);
    }

    async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
        const lastMessage = await this.messageRepository.getLastMessage(conversationId);

        if (lastMessage) {
            await this.messageReceiptRepository.markAsRead(lastMessage.id, userId);
        }
    }
}