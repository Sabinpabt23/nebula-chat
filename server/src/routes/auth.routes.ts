/**
 * Authentication Router Module
 * * @module routes/auth.routes
 * * @description
 * Express routing layer defining the network entry points for the application's authentication system.
 * It manages manual Dependency Injection (DI), handles inline request validation parsing,
 * and maps public API endpoints cleanly to their respective Controller execution targets.
 * * Architectural Architecture Roles:
 * 1. Manual Dependency Wireup — Constructs the entire data-to-logic service tree from scratch without a framework DI container.
 * 2. Fail-Fast Validation     — Intercepts inbound execution flows, passing payloads through strict structural Zod schemas.
 * 3. Route Guard Interception  — Protects high-privilege operations (e.g., /logout) using identity verification middleware layers.
 */

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

// ==========================================
// MANUAL DEPENDENCY INJECTION ENGINE
// ==========================================
// Instantiated manually bottom-up: Repositories -> Services -> Controllers
const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const refreshTokenRepository = new RefreshTokenRepository();

const tokenService = new TokenService(refreshTokenRepository);
const otpService = new OtpService(otpRepository, userRepository);
const authService = new AuthService(tokenService, otpService, userRepository);

const authController = new AuthController(authService);

// ==========================================
// ENDPOINTS & LIFECYCLE ROUTING
// ==========================================

/**
 * @route   POST /api/auth/otp/send
 * @desc    Triggers generation and transport of a one-time validation token to a user's target email.
 * @access  Public
 */
router.post('/otp/send', (req, res, next) => {
    const result = sendOtpSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data; // Reassign sanitized/stripped output back to the request payload
    authController.sendOtp(req, res, next);
});

/**
 * @route   POST /api/auth/otp/verify
 * @desc    Evaluates an incoming OTP value challenge to issue authorization tokens if valid.
 * @access  Public
 */
router.post('/otp/verify', (req, res, next) => {
    const result = verifyOtpSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    authController.verifyOtp(req, res, next);
});

/**
 * @route   POST /api/auth/google
 * @desc    Processes external identity exchange payloads delivered by Google OAuth clients.
 * @access  Public
 */
router.post('/google', (req, res, next) => {
    const result = googleAuthSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    authController.googleLogin(req, res, next);
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Consumes valid long-lived refresh tokens to mint a fresh access/refresh session pair.
 * @access  Public (Token verified inside Controller layer)
 */
router.post('/refresh', (req, res, next) => {
    authController.refreshToken(req, res, next);
});

/**
 * @route   POST /api/auth/logout
 * @desc    Blacklists an active token reference to explicitly terminate a client session.
 * @access  Protected
 */
router.post('/logout', AuthMiddleware.authenticate, (req, res, next) => {
    authController.logout(req, res, next);
});

export default router;