/**
 * User Controller
 * 
 * HTTP request handlers for user-related endpoints.
 * Routes incoming requests to UserService and returns standardized responses.
 * 
 * Endpoints:
 * - GET /users/me — Get current user profile
 * - PATCH /users/me — Update profile (displayName, avatarUrl)
 * - GET /users/search — Search users by query
 * - GET /users/:id/status — Get user online status
 * 
 * Layer: Controller (routing only — no business logic, no DB calls)
 */
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { ResponseUtil } from '../utils/response.util';

export class UserController {
    constructor(private readonly userService: UserService) {}

    getProfile = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = (req as any).user.userId;
        const user = await this.userService.getProfile(userId);

        ResponseUtil.success(res, {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            isOnline: user.isOnline,
            lastSeenAt: user.lastSeenAt,
        }, 'Profile retrieved successfully');
    };

    updateProfile = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = (req as any).user.userId;
        const user = await this.userService.updateProfile(userId, req.body);

        ResponseUtil.success(res, {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
        }, 'Profile updated successfully');
    };

  searchUsers = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { query, limit } = (req as any).validatedQuery;
    const users = await this.userService.searchUsers(query, limit || 20);

    const results = users.map((user) => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isOnline: user.isOnline,
    }));

    ResponseUtil.success(res, results, 'Users found');
};

    getUserStatus = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const id = req.params.id as string;
    const status = await this.userService.getUserStatus(id);

    ResponseUtil.success(res, status, 'User status retrieved');
};
}