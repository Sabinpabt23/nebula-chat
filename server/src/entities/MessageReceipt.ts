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