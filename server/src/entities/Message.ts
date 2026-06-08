/**
 * Message Entity
 * * Database model representing an individual message transmitted within a conversation.
 * It supports multi-format content payloads (text, multimedia, system updates), handles
 * message edit tracking, and enables nested conversational replies.
 * * Inherited Fields:
 * - id (UUID), createdAt (TIMESTAMPTZ), updatedAt (TIMESTAMPTZ) via {@link BaseEntity}
 * * Fields:
 * - conversationId (UUID)    — Foreign key connecting this message to its target chat room
 * - senderId       (UUID)    — Foreign key pointing to the User who authored the message
 * - content        (TEXT)    — The actual payload / message body (nullable to accommodate media-only items)
 * - messageType    (VARCHAR) — Content discriminator ('TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM')
 * - replyToId      (UUID)    — Self-referencing foreign key linking to a parent message (nullable)
 * - isEdited       (BOOLEAN) — Flag indicating whether the message text has been altered post-delivery
 * - editedAt       (TIMESTAMPTZ) — Timestamp tracking the exact moment the content was last updated
 * * Relationships & Optimization:
 * - ManyToOne (conversation) — Links to the parent Conversation entity (Indexed for fast message-history lookups)
 * - ManyToOne (sender)       — Links to the authoring User entity (Indexed to easily filter messages by author)
 * - ManyToOne (replyTo)      — Self-referencing association to represent message threads / quotation-replies
 * - OneToMany (receipts)     — Tracks individual delivery and read states per participant via MessageReceipts
 */

import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Conversation } from './Conversation';
import { MessageReceipt } from './MessageReceipt';

@Entity('messages')
export class Message extends BaseEntity {
    @Column({ type: 'uuid', name: 'conversation_id' })
    conversationId!: string;

    @Column({ type: 'uuid', name: 'sender_id' })
    senderId!: string;

    @Column({ type: 'text', nullable: true })
    content!: string | null;

    @Column({ type: 'varchar', length: 20, default: 'TEXT', name: 'message_type' })
    messageType!: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';

    @Column({ type: 'uuid', nullable: true, name: 'reply_to' })
    replyToId!: string | null;

    @Column({ type: 'boolean', default: false, name: 'is_edited' })
    isEdited!: boolean;

    @Column({ type: 'timestamptz', nullable: true, name: 'edited_at' })
    editedAt!: Date | null;

    @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    @Index('idx_message_conversation')
    conversation!: Conversation;

    @ManyToOne(() => User, (user) => user.messages)
    @JoinColumn({ name: 'sender_id' })
    @Index('idx_message_sender')
    sender!: User;

    @ManyToOne(() => Message, { nullable: true })
    @JoinColumn({ name: 'reply_to' })
    replyTo!: Message | null;

    @OneToMany(() => MessageReceipt, (receipt) => receipt.message)
    receipts!: MessageReceipt[];
}