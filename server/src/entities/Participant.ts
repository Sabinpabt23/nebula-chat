/**
 * Participant Entity
 * * Database model representing a composite junction table that maps users to their 
 * respective conversations (chat rooms). It manages membership states and local chat customizability.
 * * Structural Purpose:
 * Resolves the Many-to-Many relationship between Users and Conversations. It stores 
 * context specific to that intersection, such as user roles within a group chat, custom nicknames, 
 * and conversational timeline milestones.
 * * Constraints & Performance:
 * - Composite Primary Key — Combined (conversation_id, user_id) ensures a user can join a single conversation only once.
 * - Optimized Indexing      — `idx_participant_user` accelerates user-specific lookups (e.g., "fetch all chat rooms this user is in").
 * - Cascade Deletion        — Automatically removes membership instances if either the parent conversation or user is deleted.
 * * Fields:
 * - conversationId    (UUID)        — Primary Key / Foreign Key referencing the parent Conversation
 * - userId            (UUID)        — Primary Key / Foreign Key referencing the participating User
 * - role              (VARCHAR)     — Scope capability modifier ('ADMIN' | 'MEMBER')
 * - nickname          (VARCHAR)     — Custom display name overrides for specific chat views (nullable)
 * - lastReadMessageId (UUID)        — Pointer tracking the last message ID seen by this participant (handles room-level unread thresholds)
 * - joinedAt          (TIMESTAMPTZ) — Timestamp when the user entered the conversation (defaults to NOW())
 * - leftAt            (TIMESTAMPTZ) — Soft historical boundary marking when a user departed the chat room (nullable if active)
 * * Relationships:
 * - ManyToOne (conversation)        — Links back to the targeted Conversation context
 * - ManyToOne (user)                — Links back to the active User profile
 */

import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Index } from 'typeorm';
import { User } from './User';
import { Conversation } from './Conversation';

@Entity('participants')
export class Participant {
    @PrimaryColumn({ type: 'uuid', name: 'conversation_id' })
    conversationId!: string;

    @PrimaryColumn({ type: 'uuid', name: 'user_id' })
    userId!: string;

    @Column({ type: 'varchar', length: 20, default: 'MEMBER' })
    role!: 'ADMIN' | 'MEMBER';

    @Column({ type: 'varchar', length: 100, nullable: true })
    nickname!: string | null;

    @Column({ type: 'uuid', nullable: true, name: 'last_read_message_id' })
    lastReadMessageId!: string | null;

    @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'joined_at' })
    joinedAt!: Date;

    @Column({ type: 'timestamptz', nullable: true, name: 'left_at' })
    leftAt!: Date | null;

    @ManyToOne(() => Conversation, (conversation) => conversation.participants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    @ManyToOne(() => User, (user) => user.participants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    @Index('idx_participant_user')
    user!: User;
}