import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('refresh_tokens')
export class RefreshToken extends BaseEntity {
    @Column({ type: 'uuid', name: 'user_id' })
    userId!: string;

    @Column({ type: 'varchar', length: 255, unique: true, name: 'token_jti' })
    tokenJti!: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'device_info' })
    deviceInfo!: string | null;

    @Column({ type: 'inet', nullable: true, name: 'ip_address' })
    ipAddress!: string | null;

    @Column({ type: 'timestamptz', name: 'expires_at' })
    expiresAt!: Date;

    @Column({ type: 'boolean', default: false, name: 'is_revoked' })
    isRevoked!: boolean;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    @Index('idx_refresh_user')
    user!: User;
}