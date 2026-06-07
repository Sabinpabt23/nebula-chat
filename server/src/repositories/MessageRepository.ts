/**
 * Message Repository
 * 
 * Data access layer for chat messages.
 * Handles message persistence and retrieval with pagination support.
 */
import { Repository } from 'typeorm';
import { Message } from '../entities/Message';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class MessageRepository extends BaseRepository<Message> {
    private readonly messageRepository: Repository<Message>;

    constructor() {
        const repository = AppDataSource.getRepository(Message);
        super(repository);
        this.messageRepository = repository;
    }

    async findByConversation(
        conversationId: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: Message[]; total: number }> {
        const [messages, total] = await this.messageRepository.findAndCount({
            where: { conversationId },
            relations: { sender: true },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { messages, total };
    }

    async getLastMessage(conversationId: string): Promise<Message | null> {
        return this.messageRepository.findOne({
            where: { conversationId },
            relations: { sender: true },
            order: { createdAt: 'DESC' },
        });
    }

   async createMessage(data: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(data as any);
    return this.messageRepository.save(message) as unknown as Message;
}
}