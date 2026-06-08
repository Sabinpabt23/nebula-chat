/**
 * Refresh Token Repository
 * * @module repositories/RefreshTokenRepository
 * * @description
 * Concrete repository implementation managing data operations for the {@link RefreshToken} entity.
 * Extends the generic {@link BaseRepository} to inherit standardized CRUD methods while 
 * providing specialized query patterns required for JWT lifecycle state tracking, token 
 * validation routines, and emergency security session terminations.
 * * Architectural Architecture Roles:
 * 1. Cryptographic Matching — Leverages unique token signatures (JTI claims) for structural state verification.
 * 2. Targeted Blacklisting  — Implements localized session cancellation pathways without wiping adjacent device instances.
 * 3. Global Reset Hooks     — Exposes broad sweeping mutation scopes to wipe security exposure if an account compromise occurs.
 */

import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/RefreshToken';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
    private readonly refreshTokenRepository: Repository<RefreshToken>;

    /**
     * Initializes the concrete implementation instance by extracting the specific 
     * TypeORM sub-repository metadata tracking details.
     */
    constructor() {
        const repository = AppDataSource.getRepository(RefreshToken);
        super(repository);
        this.refreshTokenRepository = repository;
    }

    /**
     * Locates a token footprint by matching its unique cryptographic JSON Web Token ID (JTI).
     * @param {string} jti - Unique token claim identifier string.
     * @returns {Promise<RefreshToken | null>} The tracking entity descriptor record, or null if missing.
     */
    async findByJti(jti: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepository.findOne({ where: { tokenJti: jti } });
    }

    /**
     * Flags a single target token instance as blacklisted/revoked.
     * Typically executed when processing manual endpoint sign-out operations for a specific device.
     * @param {string} jti - Unique token claim identifier string to isolate.
     * @returns {Promise<void>}
     */
    async revokeByJti(jti: string): Promise<void> {
        await this.refreshTokenRepository.update({ tokenJti: jti }, { isRevoked: true });
    }

    /**
     * Invalidate every active token assigned to a specific user account simultaneously.
     * Critical execution path referenced during forced multi-device logouts, security 
     * credential breaches, or password reset confirmations.
     * @param {string} userId - Target account owner tracking token.
     * @returns {Promise<void>}
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            { userId, isRevoked: false },
            { isRevoked: true }
        );
    }

    /**
     * Aggregates a comprehensive ledger of all active non-revoked session contexts for a user.
     * Leverages explicit structural column projections to omit processing bulky tracking payloads 
     * while compiling real-time active device list dashboard statistics.
     * @param {string} userId - Target identity context trace.
     * @returns {Promise<RefreshToken[]>} Array of active security records filtering out standard token contents.
     */
    async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
        return this.refreshTokenRepository.find({
            where: { userId, isRevoked: false },
            select: {
                id: true,
                tokenJti: true,
                deviceInfo: true,
                expiresAt: true,
                createdAt: true,
            },
        });
    }
}