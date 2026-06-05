import crypto from 'crypto';
import { jwtUtil } from '../utils/jwt.util';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { UnauthorizedException } from '../exceptions/index';
import { logger } from '../utils/logger.util';

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class TokenService {
    constructor(
        private readonly refreshTokenRepository: RefreshTokenRepository,
    ) {}

    async generateTokenPair(user: User): Promise<TokenPair> {
        const jti = crypto.randomUUID();

        const accessToken = jwtUtil.signAccessToken({
            userId: user.id,
            email: user.email,
        });

        const refreshToken = jwtUtil.signRefreshToken({
            userId: user.id,
            tokenVersion: user.tokenVersion,
            jti,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.refreshTokenRepository.create({
            userId: user.id,
            tokenJti: jti,
            deviceInfo: null,
            ipAddress: null,
            expiresAt,
            isRevoked: false,
        } as RefreshToken);

        logger.info(`Token pair generated for user ${user.id}`);

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(oldRefreshToken: string): Promise<TokenPair> {
        const payload = jwtUtil.verifyRefreshToken(oldRefreshToken);

        const storedToken = await this.refreshTokenRepository.findByJti(payload.jti);

        if (!storedToken || storedToken.isRevoked) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (new Date() > storedToken.expiresAt) {
            await this.refreshTokenRepository.revokeByJti(payload.jti);
            throw new UnauthorizedException('Refresh token has expired');
        }

        await this.refreshTokenRepository.revokeByJti(payload.jti);

        const user = { id: payload.userId, email: '', tokenVersion: payload.tokenVersion } as User;

        return this.generateTokenPair(user);
    }

    async revokeRefreshToken(refreshToken: string): Promise<void> {
        const payload = jwtUtil.verifyRefreshToken(refreshToken);
        await this.refreshTokenRepository.revokeByJti(payload.jti);
        logger.info(`Refresh token revoked for user ${payload.userId}`);
    }

    async revokeAllUserTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository.revokeAllUserTokens(userId);
        logger.info(`All refresh tokens revoked for user ${userId}`);
    }
}