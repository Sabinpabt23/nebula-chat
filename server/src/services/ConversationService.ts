/**
 * Conversation Service
 * * Business logic for conversation management.
 * Handles creation of direct and group conversations,
 * participant management, and conversation listing.
 * * Rules:
 * - Direct conversations are unique per user pair (no duplicates)
 * - Group conversations require at least 2 members + creator
 * - Only admins can add/remove members from groups
 */
import { ConversationRepository } from '../repositories/ConversationRepository';
import { ParticipantRepository } from '../repositories/ParticipantRepository';
import { Conversation } from '../entities/Conversation';
import { ForbiddenException, BadRequestException } from '../exceptions/index';

export class ConversationService {
    constructor(
        private readonly conversationRepository: ConversationRepository,
        private readonly participantRepository: ParticipantRepository,
    ) {}

    async getUserConversations(userId: string): Promise<Conversation[]> {
        return this.conversationRepository.findByUserId(userId);
    }

    async createDirectConversation(currentUserId: string, otherUserId: string): Promise<Conversation> {
        if (currentUserId === otherUserId) {
            throw new BadRequestException('Cannot create a conversation with yourself');
        }

        const existing = await this.conversationRepository.findDirectConversation(
            currentUserId,
            otherUserId
        );

        if (existing) {
            return existing;
        }

        const conversation = await this.conversationRepository.create({
            type: 'DIRECT',
            createdById: currentUserId,
        } as Conversation);

        await this.participantRepository.addMultipleParticipants(
            conversation.id,
            [currentUserId, otherUserId],
            currentUserId
        );

        return conversation;
    }

    async createGroupConversation(
        creatorId: string,
        name: string,
        memberIds: string[]
    ): Promise<Conversation> {
        if (!name || name.trim().length === 0) {
            throw new BadRequestException('Group name is required');
        }

        if (memberIds.length < 1) {
            throw new BadRequestException('Group must have at least one other member');
        }

        const allMemberIds = [creatorId, ...memberIds.filter((id) => id !== creatorId)];

        const conversation = await this.conversationRepository.create({
            type: 'GROUP',
            name: name.trim(),
            createdById: creatorId,
        } as Conversation);

        await this.participantRepository.addMultipleParticipants(
            conversation.id,
            allMemberIds,
            creatorId
        );

        return conversation;
    }

    // Updated to conditionally reactivate returning members or add brand new ones
    async addMembers(
        conversationId: string,
        currentUserId: string,
        memberIds: string[]
    ): Promise<void> {
        const participant = await this.participantRepository.findParticipant(
            conversationId,
            currentUserId
        );

        if (!participant) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        if (participant.role !== 'ADMIN') {
            throw new ForbiddenException('Only admins can add members');
        }

        for (const userId of memberIds) {
            const existing = await this.participantRepository.findAnyParticipant(conversationId, userId);
            
            if (existing && existing.leftAt) {
                // Reactivate member who previously left or was removed
                await this.participantRepository.reactivateParticipant(conversationId, userId);
            } else if (!existing) {
                // Fallback implementation using primitive add if multi-batch isn't strictly needed for individual items
                await this.participantRepository.addMultipleParticipants(
                    conversationId,
                    [userId],
                    currentUserId
                );
            }
        }
    }

    async removeMember(
        conversationId: string,
        currentUserId: string,
        memberId: string
    ): Promise<void> {
        const participant = await this.participantRepository.findParticipant(
            conversationId,
            currentUserId
        );

        if (!participant) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        if (participant.role !== 'ADMIN' && currentUserId !== memberId) {
            throw new ForbiddenException('Only admins can remove other members');
        }

        await this.participantRepository.removeParticipant(conversationId, memberId);
    }

    async getConversationDetails(conversationId: string, userId: string): Promise<Conversation> {
        const isMember = await this.participantRepository.isMember(conversationId, userId);

        if (!isMember) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        return this.conversationRepository.findByIdOrFail(conversationId);
    }
}