/**
 * Group Controller
 * 
 * HTTP request handlers for group-specific operations.
 * Extends conversation functionality with group-focused endpoints.
 */
import { Request, Response, NextFunction } from 'express';
import { ConversationService } from '../services/ConversationService';
import { NotificationService } from '../services/NotificationService';
import { ResponseUtil } from '../utils/response.util';

export class GroupController {
    constructor(
        private readonly conversationService: ConversationService,
        private readonly notificationService: NotificationService,
    ) {}

    getUnreadCounts = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = (req as any).user.userId;
        const counts = await this.notificationService.getUnreadCounts(userId);
        ResponseUtil.success(res, counts, 'Unread counts retrieved');
    };

    getConversationUnreadCount = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = (req as any).user.userId;
        const conversationId = req.params.id as string;
        const count = await this.notificationService.getConversationUnreadCount(conversationId, userId);
        ResponseUtil.success(res, { conversationId, count }, 'Unread count retrieved');
    };
}