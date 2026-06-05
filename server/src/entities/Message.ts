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