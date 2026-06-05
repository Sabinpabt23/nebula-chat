import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/RefreshToken';
import { BaseRepository } from './BaseRepository';
import { AppDataSource } from '../config/database.config';

export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
    private readonly refreshTokenRepository: Repository<RefreshToken>;

    constructor() {
        const repository = AppDataSource.getRepository(RefreshToken);
        super(repository);
        this.refreshTokenRepository = repository;
    }

    async findByJti(jti: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepository.findOne({ where: { tokenJti: jti } });
    }

    async revokeByJti(jti: string): Promise<void> {
        await this.refreshTokenRepository.update({ tokenJti: jti }, { isRevoked: true });
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            { userId, isRevoked: false },
            { isRevoked: true }
        );
    }

    async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
        return this.refreshTokenRepository.find({
            where: { userId, isRevoked: false },
            select: {
                id: true,
                tokenJti: true,
                deviceInfo: true,
                expiresAt: true,
                createdAt: true,
            },
        });
    }
}