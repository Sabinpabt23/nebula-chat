/**
 * User Service
 * 
 * Business logic for user profile management, search, and online status.
 * 
 * Responsibilities:
 * - Retrieve and update user profiles
 * - Search users by email or display name
 * - Track and query online/offline status
 * 
 * Dependencies: UserRepository
 */
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { NotFoundException } from '../exceptions/index';
import { UpdateProfileInput } from '../validators/user.validator';

export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async getProfile(userId: string): Promise<User> {
        return this.userRepository.findByIdOrFail(userId);
    }

    async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
        const user = await this.userRepository.findByIdOrFail(userId);

        if (input.displayName !== undefined) {
            user.displayName = input.displayName;
        }

        if (input.avatarUrl !== undefined) {
            user.avatarUrl = input.avatarUrl;
        }

        return this.userRepository.update(userId, user as any);
    }

    async searchUsers(query: string, limit: number = 20): Promise<User[]> {
        return this.userRepository.searchUsers(query, limit);
    }

    async getUserStatus(userId: string): Promise<{ userId: string; isOnline: boolean; lastSeenAt: Date | null }> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            userId: user.id,
            isOnline: user.isOnline,
            lastSeenAt: user.lastSeenAt,
        };
    }


    async getPublicProfile(userId: string): Promise<{
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: Date | null;
}> {
    const user = await this.userRepository.findByIdOrFail(userId);

    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
        lastSeenAt: user.lastSeenAt,
    };
}

}