/**
 * Conversation Repository
 * 
 * Data access layer for conversation entities.
 * Provides methods to query conversations by user participation
 * and fetch conversation details with participant info.
 */
import { Repository } from 'typeorm';
import { Conversation } from '../entities/Conversation';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class ConversationRepository extends BaseRepository<Conversation> {
    private readonly conversationRepository: Repository<Conversation>;

    constructor() {
        const repository = AppDataSource.getRepository(Conversation);
        super(repository);
        this.conversationRepository = repository;
    }

    async findByUserId(userId: string): Promise<Conversation[]> {
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'participant')
            .where('participant.userId = :userId', { userId })
            .andWhere('participant.leftAt IS NULL')
            .leftJoinAndSelect('conversation.participants', 'allParticipants')
            .leftJoinAndSelect('allParticipants.user', 'user')
            .orderBy('conversation.updatedAt', 'DESC')
            .getMany();
    }

    async findDirectConversation(userId1: string, userId2: string): Promise<Conversation | null> {
        return this.conversationRepository
            .createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'p1')
            .innerJoin('conversation.participants', 'p2')
            .where('conversation.type = :type', { type: 'DIRECT' })
            .andWhere('p1.userId = :userId1', { userId1 })
            .andWhere('p1.leftAt IS NULL')
            .andWhere('p2.userId = :userId2', { userId2 })
            .andWhere('p2.leftAt IS NULL')
            .getOne();
    }
}