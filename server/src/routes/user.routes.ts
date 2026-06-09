/**
 * User Routes
 * 
 * Route definitions for user-related endpoints.
 * Handles Zod validation, wires up dependencies via manual DI,
 * and applies authentication middleware to protected routes.
 * 
 * Routes:
 * - GET    /users/me          — Get current user profile (auth required)
 * - PATCH  /users/me          — Update profile (auth required)
 * - GET    /users/search      — Search users (auth required)
 * - GET    /users/:id/status  — Get user online status (auth required)
 */
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { updateProfileSchema, searchUsersSchema } from '../validators/user.validator';
import { BadRequestException } from '../exceptions/BadRequestException';

const router = Router();

// Manual dependency injection
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// All user routes require authentication
router.use(AuthMiddleware.authenticate);

router.get('/me', (req, res, next) => {
    return userController.getProfile(req, res, next);
});

router.patch('/me', (req, res, next) => {
    const result = updateProfileSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    return userController.updateProfile(req, res, next);
});

router.get('/search', (req, res, next) => {
    const result = searchUsersSchema.safeParse(req.query);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    (req as any).validatedQuery = result.data;
    return userController.searchUsers(req, res, next);
});

router.get('/:id/status', (req, res, next) => {
    return userController.getUserStatus(req, res, next);
});

export default router;