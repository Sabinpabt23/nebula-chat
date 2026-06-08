/**
 * Refresh Token Entity
 * * Database model representing long-lived cryptographic session tokens issued to clients.
 * It tracks valid active user sessions and supports explicit session revocation, security audits,
 * and standard token-rotation mechanics.
 * * Inherited Fields:
 * - id (UUID), createdAt (TIMESTAMPTZ), updatedAt (TIMESTAMPTZ) via {@link BaseEntity}
 * * Fields:
 * - userId     (UUID)        — Foreign key identifying the account owner of this session
 * - tokenJti   (VARCHAR)     — Unique "JWT ID" identifier used to track, rotate, or match a specific cryptographic signature
 * - deviceInfo (VARCHAR)     — Client metadata string (e.g., Browser/OS) captured for user session transparency (nullable)
 * - ipAddress  (INET)        — Postgres-native network address tracking the device's last active IP location (nullable)
 * - expiresAt  (TIMESTAMPTZ) — Expiration boundary matching the JWT payload's exp claim
 * - isRevoked  (BOOLEAN)     — Blacklist flag to immediately terminate a session before its natural expiration
 * * Relationships & Performance:
 * - ManyToOne (user)         — Links back to the targeted User entity (Indexed for rapid user-session lookups)
 * - Cascade Deletion         — Automatically wipes out downstream active session keys if the parent User account is deleted
 */

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
    @Column({ type: 'uuid', name: 'user_id' })
    userId!: string;

    @Column({ type: 'varchar', length: 255, unique: true, name: 'token_jti' })
    tokenJti!: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'device_info' })
    deviceInfo!: string | null;

    @Column({ type: 'inet', nullable: true, name: 'ip_address' })
    ipAddress!: string | null;

    @Column({ type: 'timestamptz', name: 'expires_at' })
    expiresAt!: Date;

    @Column({ type: 'boolean', default: false, name: 'is_revoked' })
    isRevoked!: boolean;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    @Index('idx_refresh_user')
    user!: User;
}