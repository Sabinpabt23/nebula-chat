/**
 * Message Receipt Repository
 * 
 * Data access layer for message read receipts.
 * Tracks which users have read which messages in conversations.
 * Used for unread count calculations and read indicators.
 */
import { Repository } from 'typeorm';
import { MessageReceipt } from '../entities/MessageReceipt';
import { AppDataSource } from '../config/database.config';

export class MessageReceiptRepository {
    private readonly receiptRepository: Repository<MessageReceipt>;

    constructor() {
        this.receiptRepository = AppDataSource.getRepository(MessageReceipt);
    }

    async markAsRead(messageId: string, userId: string): Promise<void> {
        const existing = await this.receiptRepository.findOne({
            where: { messageId, userId },
        });

        if (!existing) {
            const receipt = this.receiptRepository.create({
                messageId,
                userId,
                readAt: new Date(),
            });
            await this.receiptRepository.save(receipt);
        }
    }

    async markMultipleAsRead(messageIds: string[], userId: string): Promise<void> {
        const receipts = messageIds.map((messageId) =>
            this.receiptRepository.create({
                messageId,
                userId,
                readAt: new Date(),
            })
        );
        await this.receiptRepository.save(receipts);
    }

  async getUnreadCount(conversationId: string, userId: string, lastReadMessageId: string | null): Promise<number> {
    const query = this.receiptRepository.manager
        .createQueryBuilder()
        .select('COUNT(DISTINCT message.id)', 'count')
        .from('messages', 'message')
        .leftJoin('message_receipts', 'receipt', 
            'receipt.message_id = message.id AND receipt.user_id = :userId', 
            { userId }
        )
        .where('message.conversationId = :conversationId', { conversationId })
        .andWhere('message.senderId != :userId', { userId })
        .andWhere('receipt.message_id IS NULL');

    if (lastReadMessageId) {
        query.andWhere('message.id > :lastReadMessageId', { lastReadMessageId });
    }

    const result = await query.getRawOne();
    return result ? parseInt(result.count, 10) : 0;
}

    async isMessageRead(messageId: string, userId: string): Promise<boolean> {
        const receipt = await this.receiptRepository.findOne({
            where: { messageId, userId },
        });
        return receipt !== null && receipt.readAt !== null;
    }
}