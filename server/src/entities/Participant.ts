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