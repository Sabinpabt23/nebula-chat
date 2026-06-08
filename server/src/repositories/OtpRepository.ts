/**
 * Otp Repository
 * * @module repositories/OtpRepository
 * * @description
 * Concrete repository implementation managing data operations for the {@link Otp} entity.
 * Extends the generic {@link BaseRepository} to inherit standardized CRUD methods while 
 * exposing optimized specialized queries to facilitate token validation, security auditing,
 * and lifecycle updates.
 * * Architectural Architecture Roles:
 * 1. Data Store Isolation — Connects directly to the native `AppDataSource` database context instance.
 * 2. Order Priority      — Enforces strict chronological sorting constraints (`DESC` sequence on processing timelines).
 * 3. Atomic Invalidation  — Utilizes structural execution wrappers (`increment`) to prevent parallel field race conditions.
 */

import { Repository, MoreThan } from 'typeorm';
import { Otp } from '../entities/Otp';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class OtpRepository extends BaseRepository<Otp> {
    private readonly otpRepository: Repository<Otp>;

    /**
     * Initializes the concrete implementation instance by extracting the specific 
     * TypeORM sub-repository metadata tracking details.
     */
    constructor() {
        const repository = AppDataSource.getRepository(Otp);
        super(repository);
        this.otpRepository = repository;
    }

    /**
     * Locates the current active, non-expired, and non-consumed validation token assigned to a specific email context.
     * @param {string} email - Target account contact string.
     * @returns {Promise<Otp | null>} The active token entity descriptor record, or null if missing/stale.
     */
    async findValidByEmail(email: string): Promise<Otp | null> {
        return this.otpRepository.findOne({
            where: {
                email,
                isUsed: false,
                expiresAt: MoreThan(new Date()),
            },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Retrieves the absolute latest recorded token footprint for an email destination without checking evaluation rules.
     * Often referenced by rate-limiting verification logic to compute transmission intervals (e.g., resend lockout windows).
     * @param {string} email - Target identity trace.
     * @returns {Promise<Otp | null>} The most recently recorded OTP entry row metadata profile.
     */
    async findRecentByEmail(email: string): Promise<Otp | null> {
        return this.otpRepository.findOne({
            where: { email },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Closes the active state window of a validation record by flagging it as used.
     * This execution path permanently blocks potential token replay processing workflows.
     * @param {string} id - Structural UUID corresponding to the target row tracking index.
     * @returns {Promise<void>}
     */
    async markUsed(id: string): Promise<void> {
        await this.otpRepository.update(id, { isUsed: true });
    }

    /**
     * Atomically increments the numeric failure log tracking bounds attached to a specific verification transaction.
     * Leverages native database-level increments to maintain accuracy during high-volume concurrent operations.
     * @param {string} id - Structural UUID trace.
     * @returns {Promise<void>}
     */
    async incrementAttempts(id: string): Promise<void> {
        await this.otpRepository.increment({ id }, 'attempts', 1);
    }
}