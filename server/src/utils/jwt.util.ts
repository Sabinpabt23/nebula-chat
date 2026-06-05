import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';

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
        const options: SignOptions = { expiresIn: env.jwt.accessExpiry as any };
        return jwt.sign(payload as object, this.accessSecret, options);
    }

    signRefreshToken(payload: RefreshTokenPayload): string {
        const options: SignOptions = { expiresIn: env.jwt.refreshExpiry as any };
        return jwt.sign(payload as object, this.refreshSecret, options);
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        return jwt.verify(token, this.accessSecret) as AccessTokenPayload;
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
        return jwt.verify(token, this.refreshSecret) as RefreshTokenPayload;
    }
}

export const jwtUtil = new JwtUtil();