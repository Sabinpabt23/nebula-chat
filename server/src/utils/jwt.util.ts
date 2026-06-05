import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

interface AccessTokenPayload {
    userId: string;
    email: string;
}

interface RefreshTokenPayload {
    userId: string;
    tokenVersion: number;
    jti: string;
}

class JwtUtil {
    private readonly accessSecret: string;
    private readonly refreshSecret: string;

    constructor() {
        this.accessSecret = env.jwt.accessSecret;
        this.refreshSecret = env.jwt.refreshSecret;
    }

    signAccessToken(payload: AccessTokenPayload): string {
        return jwt.sign(payload as object, this.accessSecret, {
            expiresIn: env.jwt.accessExpiry as any,
        });
    }

    signRefreshToken(payload: RefreshTokenPayload): string {
        return jwt.sign(payload as object, this.refreshSecret, {
            expiresIn: env.jwt.refreshExpiry as any,
        });
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        try {
            return jwt.verify(token, this.accessSecret) as AccessTokenPayload;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Access token has expired');
            }
            throw new UnauthorizedException('Invalid access token');
        }
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
        try {
            return jwt.verify(token, this.refreshSecret) as RefreshTokenPayload;
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Refresh token has expired');
            }
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}

export const jwtUtil = new JwtUtil();