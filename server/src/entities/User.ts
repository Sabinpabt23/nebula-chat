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