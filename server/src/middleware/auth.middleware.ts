/**
 * Authentication Middleware
 * 
 * Verifies JWT bearer tokens from the Authorization header.
 * Attaches decoded user info (userId, email) to the request object.
 * Throws UnauthorizedException for missing, invalid, or expired tokens.
 */
import { Request, Response, NextFunction } from 'express';
import { jwtUtil } from '../utils/jwt.util';
import { UnauthorizedException } from '../exceptions/UnauthorizedException';

export class AuthMiddleware {
    static authenticate(req: Request, _res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Access token not provided');
        }

        const payload = jwtUtil.verifyAccessToken(token);

        (req as any).user = {
            userId: payload.userId,
            email: payload.email,
        };

        next();
    }
}