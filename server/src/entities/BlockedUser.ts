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