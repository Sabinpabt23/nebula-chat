/**
 * User Entity
 * * Database model representing a primary user account within the system.
 * It serves as the absolute core entity for the database schema, anchoring identity,
 * presence status, authentication tokens, and social/communication networks.
 * * Inherited Fields:
 * - id (UUID), createdAt (TIMESTAMPTZ), updatedAt (TIMESTAMPTZ) via {@link BaseEntity}
 * * Fields:
 * - email        (VARCHAR)     — Unique primary contact and login identifier
 * - displayName  (VARCHAR)     — User's customizable public profile name
 * - avatarUrl    (TEXT)        — URL pointing to the user's uploaded or fetched profile picture (nullable)
 * - googleId     (VARCHAR)     — Unique OAuth identifier used for Google single sign-on mapping (nullable)
 * - isOnline     (BOOLEAN)     — Real-time network presence flag (frequently toggled via WebSocket hooks)
 * - lastSeenAt   (TIMESTAMPTZ) — Timestamp of the user's last interaction or WebSocket disconnection (nullable)
 * - tokenVersion (INT)         — Monotonically increasing counter used to instantly invalidate all historical 
 * tokens for a user simultaneously (e.g., during a forced password/session reset)
 * * Relationships (OneToMany Collections):
 * - refreshTokens  — Active long-lived login sessions tied to devices
 * - participants   — Room memberships bridging this user to various group or direct conversations
 * - messages       — History of all communication text or media entries sent by this account
 * - messageReceipts— Log tracking which specific messages this user has delivered or read
 * - blockedUsers   — Records of other user accounts explicitly muted or blocked by this user
 * - blockedByUsers — Records of other users who have explicitly muted or blocked this account
 */

import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { RefreshToken } from './RefreshToken';
import { Participant } from './Participant';
import { Message } from './Message';
import { MessageReceipt } from './MessageReceipt';
import { BlockedUser } from './BlockedUser';

@Entity('users')
export class User extends BaseEntity {
    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 100, name: 'display_name' })
    displayName!: string;

    @Column({ type: 'text', nullable: true, name: 'avatar_url' })
    avatarUrl!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true, unique: true, name: 'google_id' })
    googleId!: string | null;

    @Column({ type: 'boolean', default: false, name: 'is_online' })
    isOnline!: boolean;

    @Column({ type: 'timestamptz', nullable: true, name: 'last_seen_at' })
    lastSeenAt!: Date | null;

    @Column({ type: 'int', default: 0, name: 'token_version' })
    tokenVersion!: number;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
    refreshTokens!: RefreshToken[];

    @OneToMany(() => Participant, (participant) => participant.user)
    participants!: Participant[];

    @OneToMany(() => Message, (message) => message.sender)
    messages!: Message[];

    @OneToMany(() => MessageReceipt, (receipt) => receipt.user)
    messageReceipts!: MessageReceipt[];

    @OneToMany(() => BlockedUser, (blocked) => blocked.blocker)
    blockedUsers!: BlockedUser[];

    @OneToMany(() => BlockedUser, (blocked) => blocked.blocked)
    blockedByUsers!: BlockedUser[];
}