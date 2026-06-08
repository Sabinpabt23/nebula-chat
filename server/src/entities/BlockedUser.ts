/**
 * Blocked User Entity
 * * Database model representing a self-referencing composite join table for handling 
 * user blocking mechanics. It tracks which user has blocked another user.
 * * Constraints & Rules:
 * - Composite Primary Key — Combined (blocker_id, blocked_id) enforces that a block record is unique.
 * - Database Check Constraint — Explicitly prevents a user from blocking themselves ("blocker_id" != "blocked_id").
 * - Cascade Deletion — If either the blocker or the blocked user account is deleted, the block record is destroyed automatically.
 * * Fields:
 * - blockerId (UUID)        — Primary Key / Foreign Key pointing to the User initiating the block
 * - blockedId (UUID)        — Primary Key / Foreign Key pointing to the User being blocked
 * - blockedAt (TIMESTAMPTZ) — Timestamp marking when the block event took place (defaults to NOW())
 * * Relationships:
 * - ManyToOne (blocker)     — Connects back to the initiating User entity
 * - ManyToOne (blocked)     — Connects back to the targeted User entity
 */

import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Check } from 'typeorm';
import { User } from './User';

@Entity('blocked_users')
@Check(`"blocker_id" != "blocked_id"`)
export class BlockedUser {
    @PrimaryColumn({ type: 'uuid', name: 'blocker_id' })
    blockerId!: string;

    @PrimaryColumn({ type: 'uuid', name: 'blocked_id' })
    blockedId!: string;

    @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'blocked_at' })
    blockedAt!: Date;

    @ManyToOne(() => User, (user) => user.blockedUsers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'blocker_id' })
    blocker!: User;

    @ManyToOne(() => User, (user) => user.blockedByUsers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'blocked_id' })
    blocked!: User;
}