import { Request, Response, NextFunction } from 'express';
import { jwtUtil } from '../utils/jwt.util';

export class AuthMiddleware {
    static authenticate(req: Request, _res: Response, next: NextFunction): void {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('Missing or invalid authorization header');
            error.name = 'UnauthorizedError';
            throw error;
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            const error = new Error('Access token not provided');
            error.name = 'UnauthorizedError';
            throw error;
        }

        const payload = jwtUtil.verifyAccessToken(token);

        (req as any).user = {
            userId: payload.userId,
            email: payload.email,
        };

        next();
    }
}