/**
 * Message Receipt Entity
 * * Database model representing a composite join table that tracks the delivery and read 
 * statuses of individual chat messages on a per-user basis.
 * * Structural Purpose:
 * Enforces the application's "double checkmark" read-receipt system. It calculates 
 * which messages are unread, delivered, or seen by specific users in shared chat environments.
 * * Constraints & Performance:
 * - Composite Primary Key — Combined (message_id, user_id) guarantees a user only has one receipt state per message.
 * - Optimized Indexing      — `idx_receipt_user_unread` optimizes heavy data reads like calculating unread badge counts for a user.
 * - Cascade Deletion        — Automatically removes rows if either the parent message or target user is dropped.
 * * Fields:
 * - messageId   (UUID)        — Primary Key / Foreign Key referencing the sent Message
 * - userId      (UUID)        — Primary Key / Foreign Key referencing the recipient User
 * - readAt      (TIMESTAMPTZ) — Timestamp when the user opened/viewed the message (defaults to NOW() upon entry)
 * - deliveredAt (TIMESTAMPTZ) — Timestamp when the message reached the client device (nullable if pending delivery)
 * * Relationships:
 * - ManyToOne (message)       — Links back to the targeted Message entity
 * - ManyToOne (user)          — Links back to the receiving User entity
 */

import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Index } from 'typeorm';
import { Message } from './Message';
import { User } from './User';

@Entity('message_receipts')
export class MessageReceipt {
    @PrimaryColumn({ type: 'uuid', name: 'message_id' })
    messageId!: string;

    @PrimaryColumn({ type: 'uuid', name: 'user_id' })
    userId!: string;

    @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'read_at' })
    readAt!: Date;

    @Column({ type: 'timestamptz', nullable: true, name: 'delivered_at' })
    deliveredAt!: Date | null;

    @ManyToOne(() => Message, (message) => message.receipts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'message_id' })
    message!: Message;

    @ManyToOne(() => User, (user) => user.messageReceipts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    @Index('idx_receipt_user_unread')
    user!: User;
}