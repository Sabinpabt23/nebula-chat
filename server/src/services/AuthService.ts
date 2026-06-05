import { OAuth2Client } from 'google-auth-library';
import { TokenService } from './TokenService';
import { OtpService } from './OtpService';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { env } from '../config/env.config';
import { UnauthorizedException } from '../exceptions/index';
import { logger } from '../utils/logger.util';
import { jwtUtil } from '../utils/jwt.util';

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
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new UnauthorizedException('Invalid Google credential');
        }

        const { email, name, picture, sub: googleId } = payload;

        let user = await this.userRepository.findByGoogleId(googleId);

        if (!user) {
            user = await this.userRepository.findByEmail(email!);

            if (user) {
                user.googleId = googleId;
                user.avatarUrl = user.avatarUrl || picture || null;
                await this.userRepository.update(user.id, user as any);
            } else {
                user = await this.userRepository.create({
                    email: email!,
                    displayName: name || email!.split('@')[0],
                    avatarUrl: picture || null,
                    googleId,
                } as User);
            }

            logger.info(`User ${user.id} linked with Google OAuth (${email})`);
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
    const payload = jwtUtil.verifyAccessToken(tokens.accessToken);
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