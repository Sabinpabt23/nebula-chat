/**
 * Participant Repository
 * 
 * Data access layer for conversation participants.
 * Manages membership records — adding, removing, and querying
 * participants within conversations.
 */
import { Repository } from 'typeorm';
import { Participant } from '../entities/Participant';
import { AppDataSource } from '../config/database.config';

export class ParticipantRepository {
    private readonly participantRepository: Repository<Participant>;

    constructor() {
        this.participantRepository = AppDataSource.getRepository(Participant);
    }

    async addParticipant(conversationId: string, userId: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER'): Promise<Participant> {
        const participant = this.participantRepository.create({
            conversationId,
            userId,
            role,
            joinedAt: new Date(),
        });
        return this.participantRepository.save(participant);
    }

    async addMultipleParticipants(conversationId: string, userIds: string[], adminId: string): Promise<void> {
        const participants = userIds.map((userId) =>
            this.participantRepository.create({
                conversationId,
                userId,
                role: userId === adminId ? 'ADMIN' : 'MEMBER',
                joinedAt: new Date(),
            })
        );
        await this.participantRepository.save(participants);
    }

    async removeParticipant(conversationId: string, userId: string): Promise<void> {
        await this.participantRepository.update(
            { conversationId, userId },
            { leftAt: new Date() }
        );
    }

    async findByConversation(conversationId: string): Promise<Participant[]> {
    return this.participantRepository.find({
        where: { conversationId, leftAt: null as any },
        relations: { user: true },
    });
}

    async findParticipant(conversationId: string, userId: string): Promise<Participant | null> {
        return this.participantRepository.findOne({
            where: { conversationId, userId, leftAt: null as any },
        });
    }

    async isMember(conversationId: string, userId: string): Promise<boolean> {
        const participant = await this.findParticipant(conversationId, userId);
        return participant !== null;
    }

    async getParticipantIds(conversationId: string): Promise<string[]> {
        const participants = await this.findByConversation(conversationId);
        return participants.map((p) => p.userId);
    }
}