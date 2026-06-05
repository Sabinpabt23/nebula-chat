import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ResponseUtil } from '../utils/response.util';
import { env } from '../config/env.config';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    sendOtp = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { email } = req.body;
        const result = await this.authService.sendOtp(email);
        ResponseUtil.success(res, result, 'OTP sent successfully');
    };

    verifyOtp = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { email, code } = req.body;
        const tokens = await this.authService.verifyOtp(email, code);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: 'strict',
            domain: env.cookie.domain,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        ResponseUtil.success(res, {
            accessToken: tokens.accessToken,
            user: tokens.user,
        }, 'Login successful');
    };

    googleLogin = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const { credential } = req.body;
        const tokens = await this.authService.googleLogin(credential);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: 'strict',
            domain: env.cookie.domain,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        ResponseUtil.success(res, {
            accessToken: tokens.accessToken,
            user: tokens.user,
        }, 'Login successful');
    };

    refreshToken = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            ResponseUtil.error(res, 401, 'UNAUTHORIZED', 'Refresh token not found');
            return;
        }

        const tokens = await this.authService.refreshToken(refreshToken);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: 'strict',
            domain: env.cookie.domain,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        ResponseUtil.success(res, {
            accessToken: tokens.accessToken,
            user: tokens.user,
        }, 'Token refreshed');
    };

    logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: 'strict',
            domain: env.cookie.domain,
        });

        ResponseUtil.success(res, null, 'Logged out successfully');
    };
}