/**
 * Message Controller
 * 
 * HTTP request handlers for message endpoints.
 * Routes incoming requests to MessageService.
 * 
 * Endpoints:
 * - GET  /conversations/:id/messages  — Get message history (paginated)
 * - POST /conversations/:id/messages  — Send a message
 * - POST /messages/:id/read           — Mark message as read
 */
import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/MessageService';
import { ResponseUtil } from '../utils/response.util';
import { PAGINATION } from '../utils/constants.util';

export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    sendMessage = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const senderId = (req as any).user.userId;
        const conversationId = req.params.id as string;
        const { content, messageType } = req.body;
        const message = await this.messageService.sendMessage(
            senderId,
            conversationId,
            content,
            messageType
        );
        ResponseUtil.created(res, message, 'Message sent');
    };

    getMessages = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = (req as any).user.userId;
    const conversationId = req.params.id as string;
    const validatedQuery = (req as any).validatedQuery || {};
    const page = validatedQuery.page || PAGINATION.DEFAULT_PAGE;
    const limit = validatedQuery.limit || PAGINATION.DEFAULT_LIMIT;

    const result = await this.messageService.getMessages(conversationId, userId, page, limit);

    ResponseUtil.paginated(res, result.messages, {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasNextPage: page * limit < result.total,
        hasPreviousPage: page > 1,
    }, 'Messages retrieved');
};

    markAsRead = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = (req as any).user.userId;
        const messageId = req.params.id as string;
        await this.messageService.markAsRead(messageId, userId);
        ResponseUtil.success(res, null, 'Message marked as read');
    };
}