import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('otps')
export class Otp extends BaseEntity {
    @Column({ type: 'varchar', length: 255 })
    @Index('idx_otp_email_expires')
    email!: string;

    @Column({ type: 'varchar', length: 255, name: 'code_hash' })
    codeHash!: string;

    @Column({ type: 'varchar', length: 20, default: 'LOGIN' })
    purpose!: 'LOGIN' | 'VERIFY_EMAIL';

    @Column({ type: 'int', default: 0 })
    attempts!: number;

    @Column({ type: 'int', default: 3, name: 'max_attempts' })
    maxAttempts!: number;

    @Column({ type: 'timestamptz', name: 'expires_at' })
    expiresAt!: Date;

    @Column({ type: 'boolean', default: false, name: 'is_used' })
    isUsed!: boolean;
}