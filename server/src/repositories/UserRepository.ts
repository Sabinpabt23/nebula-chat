/**
 * User Repository
 * * @module repositories/UserRepository
 * * @description
 * Concrete repository implementation managing data operations for the {@link User} entity.
 * Extends the generic {@link BaseRepository} to inherit standard CRUD behaviors while 
 * exposing tailored query hooks for core authentication providers, bulk operations, 
 * and fuzz-matched client search queries.
 * * Architectural Architecture Roles:
 * 1. Auth Pipeline Entry  — Acts as the data resolver for local email logins and third-party OAuth flows.
 * 2. Efficient Batching   — Implements vectorized fetching protocols to mitigate standard N+1 query patterns.
 * 3. Dynamic Query Scaling — Drops out of abstract ORM abstraction matrices down to explicit QueryBuilders 
 * to handle specialized indexing operations like case-insensitive partial filtering.
 */

import { Repository, In } from 'typeorm';
import { User } from '../entities/User';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class UserRepository extends BaseRepository<User> {
    private readonly userRepository: Repository<User>;

    /**
     * Initializes the concrete implementation instance by extracting the specific 
     * TypeORM sub-repository metadata tracking details.
     */
    constructor() {
        const repository = AppDataSource.getRepository(User);
        super(repository);
        this.userRepository = repository;
    }

    /**
     * Resolves a user account footprint utilizing its verified unique email address.
     * Core utility invoked during traditional local password or OTP-based authentication strategies.
     * @param {string} email - Target account contact string to match.
     * @returns {Promise<User | null>} The verified user entity profile or null if unmatched.
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    /**
     * Resolves a user account profile by searching against a unique external identity provider token string.
     * Core utility invoked by Google single sign-on strategy filters to process instant OAuth logins.
     * @param {string} googleId - The external third-party identifier string.
     * @returns {Promise<User | null>} The verified user entity profile or null if unmatched.
     */
    async findByGoogleId(googleId: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { googleId } });
    }

    /**
     * Resolves a collection of user identities matching an explicit batch array of primary keys.
     * heavily referenced during group channel hydration or message receipt mapping to prevent serial runtime query loops.
     * @param {string[]} ids - Collection of string UUID keys to target.
     * @returns {Promise<User[]>} Array listing all located user profile frames.
     */
    async findByIds(ids: string[]): Promise<User[]> {
        return this.userRepository.find({ where: { id: In(ids) } });
    }

    /**
     * Executes an iterative partial string-match algorithm using native SQL ILIKE mechanics.
     * Used exclusively to feed client-side auto-complete search fields when browsing for new contacts.
     * @param {string} query - Plain text search filter payload targeting fields like name segments or emails.
     * @param {number} [limit=20] - Safe pagination cutoff constraint defining the maximum depth returned.
     * @returns {Promise<User[]>} Vector containing matching user resource maps.
     */
    async searchUsers(query: string, limit: number = 20): Promise<User[]> {
        return this.userRepository
            .createQueryBuilder('user')
            .where('user.email ILIKE :query', { query: `%${query}%` })
            .orWhere('user.displayName ILIKE :query', { query: `%${query}%` })
            .limit(limit)
            .getMany();
    }
}