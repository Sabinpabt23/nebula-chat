import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { TokenService } from '../services/TokenService';
import { OtpService } from '../services/OtpService';
import { UserRepository } from '../repositories/UserRepository';
import { OtpRepository } from '../repositories/OtpRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { sendOtpSchema, verifyOtpSchema, googleAuthSchema } from '../validators/auth.validator';
import { BadRequestException } from '../exceptions/BadRequestException';

const router = Router();

// Manual DI
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const refreshTokenRepository = new RefreshTokenRepository();
const tokenService = new TokenService(refreshTokenRepository);
const otpService = new OtpService(otpRepository, userRepository);
const authService = new AuthService(tokenService, otpService, userRepository);
const authController = new AuthController(authService);

router.post('/otp/send', (req, res, next) => {
    const result = sendOtpSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    authController.sendOtp(req, res, next);
});

router.post('/otp/verify', (req, res, next) => {
    const result = verifyOtpSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    authController.verifyOtp(req, res, next);
});

router.post('/google', (req, res, next) => {
    const result = googleAuthSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    authController.googleLogin(req, res, next);
});

router.post('/refresh', (req, res, next) => {
    authController.refreshToken(req, res, next);
});

router.post('/logout', AuthMiddleware.authenticate, (req, res, next) => {
    authController.logout(req, res, next);
});

export default router;