/**
 * Auth Service
 * 
 * Orchestrates authentication flows: OTP login, Google OAuth, and token refresh.
 * Coordinates between TokenService, OtpService, and UserRepository.
 * 
 * Security:
 * - Google ID tokens are verified with audience validation against our client ID
 * - Refresh tokens are rotated on each use (old token revoked, new pair issued)
 * - Users are auto-created on first OTP or Google login
 */
import { OAuth2Client } from 'google-auth-library';
import { TokenService } from './TokenService';
import { OtpService } from './OtpService';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { jwtUtil } from '../utils/jwt.util';
import { env } from '../config/env.config';
import { UnauthorizedException } from '../exceptions/index';
import { logger } from '../utils/logger.util';

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        displayName: string;
        avatarUrl: string | null;
    };
}

interface AccessTokenPayload {
    userId: string;
    email: string;
}

export class AuthService {
    private readonly googleClient: OAuth2Client;

    constructor(
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService,
        private readonly userRepository: UserRepository,
    ) {
        this.googleClient = new OAuth2Client({
            clientId: env.google.clientId,
            clientSecret: env.google.clientSecret,
        });
    }

    async sendOtp(email: string): Promise<{ success: boolean }> {
        return this.otpService.sendOtp(email);
    }

    async verifyOtp(email: string, code: string): Promise<AuthTokens> {
        const user = await this.otpService.verifyOtp(email, code);
        const tokens = await this.tokenService.generateTokenPair(user);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        };
    }

    async googleLogin(credential: string): Promise<AuthTokens> {
        const ticket = await this.googleClient.verifyIdToken({
            idToken: credential,
            audience: env.google.clientId,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new UnauthorizedException('Invalid Google credential');
        }

        const { email, name, picture, sub: googleId } = payload;

        let user = await this.userRepository.findByGoogleId(googleId);

        if (!user) {
            const existingUser = await this.userRepository.findByEmail(email!);

            if (existingUser) {
                existingUser.googleId = googleId;
                existingUser.avatarUrl = existingUser.avatarUrl || picture || null;
                user = await this.userRepository.update(existingUser.id, existingUser as any);
                logger.info(`Existing user ${user.id} linked with Google OAuth (${email})`);
            } else {
                user = await this.userRepository.create({
                    email: email!,
                    displayName: name || email!.split('@')[0],
                    avatarUrl: picture || null,
                    googleId,
                } as User);
                logger.info(`New user ${user.id} created via Google OAuth (${email})`);
            }
        }

        const tokens = await this.tokenService.generateTokenPair(user);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        };
    }

    async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
        const tokens = await this.tokenService.refreshAccessToken(oldRefreshToken);
        const payload = jwtUtil.verifyAccessToken(tokens.accessToken) as AccessTokenPayload;
        const user = await this.userRepository.findByIdOrFail(payload.userId);

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
            },
        };
    }

    async logout(refreshToken: string): Promise<void> {
        await this.tokenService.revokeRefreshToken(refreshToken);
        logger.info('User logged out');
    }
}