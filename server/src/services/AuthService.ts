/**
 * Main Authentication Orchestration Service
 * * @module services/AuthService
 * * @description
 * High-level domain business logic coordinator managing user access lifecycles. 
 * This service sits directly between inbound HTTP request entry controllers and specialized, 
 * single-responsibility modules (`OtpService`, `TokenService`, `UserRepository`).
 * * Security Matrix:
 * - Google ID tokens are strictly verified with audience validation against our Client ID.
 * - Refresh tokens are rotated on each use (old token revoked, new pair issued).
 * - Users are auto-created on first valid OTP verification or Google OAuth login.
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

    /**
     * Initializes the orchestrator service, embedding its dependency graph 
     * and initializing the secure Google OAuth2 network verification channel.
     */
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

    /**
     * Routes verification triggers down to the underlying standalone OTP module.
     * @param {string} email - Target inbox destination address.
     * @returns {Promise<{ success: boolean }>} Operational confirmation response.
     */
    async sendOtp(email: string): Promise<{ success: boolean }> {
        return this.otpService.sendOtp(email);
    }

    /**
     * Executes double-pass transactional validation matching an OTP token challenge 
     * and instantly mints structural access sessions upon verification success.
     * @param {string} email - Registration identity string.
     * @param {string} code - Dynamic challenge string code.
     * @returns {Promise<AuthTokens>} Unified application access token profile map.
     */
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

    /**
     * Decodes and validates third-party cryptographic Google Identity claims tokens.
     * Dynamically forks into identity linking patterns or profile synthesis trees.
     * @param {string} credential - Raw Google ID token payload supplied by the front-end client.
     * @throws {UnauthorizedException} If the ticket is altered or authentication fails structural validation.
     * @returns {Promise<AuthTokens>} Fully populated session metadata profile map.
     */
    async googleLogin(credential: string): Promise<AuthTokens> {
        const ticket = await this.googleClient.verifyIdToken({
            idToken: credential,
            audience: env.google.clientId, // Prevents cross-app token reuse vulnerabilities
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            throw new UnauthorizedException('Invalid Google credential');
        }

        const { email, name, picture, sub: googleId } = payload;

        // Identity Optimization Routine: Attempt lookup using unique Social Provider ID
        let user = await this.userRepository.findByGoogleId(googleId);

        if (!user) {
            // Soft-Match Strategy: Look up existing user account by Email index
            const existingUser = await this.userRepository.findByEmail(email!);

            if (existingUser) {
                // Progressive Account Merging: Connect OAuth metadata to existing email identity profile
                existingUser.googleId = googleId;
                existingUser.avatarUrl = existingUser.avatarUrl || picture || null;
                user = await this.userRepository.update(existingUser.id, existingUser as any);
                logger.info(`Existing user ${user.id} linked with Google OAuth (${email})`);
            } else {
                // Identity Generation Routine: Provision a brand-new registration account trace
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

    /**
     * Re-evaluates long-lived session lifecycle tokens to mint an updated transport authorization token.
     * @param {string} oldRefreshToken - The existing token string to replace.
     * @returns {Promise<AuthTokens>} Renewed session token payload maps.
     */
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

    /**
     * Executes programmatic revocation on the targeting refresh session payload string.
     * @param {string} refreshToken - Active credential payload to safely invalidate.
     * @returns {Promise<void>}
     */
    async logout(refreshToken: string): Promise<void> {
        await this.tokenService.revokeRefreshToken(refreshToken);
        logger.info('User logged out');
    }
}