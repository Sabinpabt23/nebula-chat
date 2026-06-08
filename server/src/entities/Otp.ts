/**
 * OTP (One-Time Password) Entity
 * * Database model representing temporary, short-lived verification codes issued to users.
 * It manages token validation, usage state, and built-in rate-limiting logic to defend 
 * against brute-force credential stuffing attacks.
 * * Inherited Fields:
 * - id (UUID), createdAt (TIMESTAMPTZ), updatedAt (TIMESTAMPTZ) via {@link BaseEntity}
 * * Fields:
 * - email       (VARCHAR)     — The target user's email address (Indexed along with expiration for high-speed lookup)
 * - codeHash    (VARCHAR)     — One-way cryptographic hash of the plaintext OTP token (for database security)
 * - purpose     (VARCHAR)     — Action context discriminator ('LOGIN' | 'VERIFY_EMAIL')
 * - attempts    (INT)         — Counter tracking failed verification requests within this token's lifecycle
 * - maxAttempts (INT)         — Maximum threshold allowed before the token is permanently invalidated (defaults to 3)
 * - expiresAt   (TIMESTAMPTZ) — Hard absolute timestamp marking when the token becomes invalid
 * - isUsed      (BOOLEAN)     — State flag ensuring single-use compliance (prevents replay attacks)
 */

import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('otps')
export class Otp extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    @Index('idx_otp_email_expires')
    email!: string;

    @Column({ type: 'varchar', length: 255, name: 'code_hash' })
    codeHash!: string;

    @Column({ type: 'varchar', length: 20, default: 'LOGIN' })
    purpose!: 'LOGIN' | 'VERIFY_EMAIL';

    @Column({ type: 'int', default: 0 })
    attempts!: number;

    @Column({ type: 'int', default: 3, name: 'max_attempts' })
    maxAttempts!: number;

    @Column({ type: 'timestamptz', name: 'expires_at' })
    expiresAt!: Date;

    @Column({ type: 'boolean', default: false, name: 'is_used' })
    isUsed!: boolean;
}