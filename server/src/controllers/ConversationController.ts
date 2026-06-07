/**
 * Conversation Controller
 * 
 * HTTP request handlers for conversation endpoints.
 * Routes incoming requests to ConversationService.
 * 
 * Endpoints:
 * - GET    /conversations              — List user's conversations
 * - POST   /conversations/dm           — Create direct message
 * - POST   /conversations/group        — Create group conversation
 * - GET    /conversations/:id          — Get conversation details
 * - POST   /conversations/:id/members  — Add members (admin only)
 * - DELETE /conversations/:id/members/:userId — Remove member
 */
import { Request, Response, NextFunction } from 'express';
import { ConversationService } from '../services/ConversationService';
import { ResponseUtil } from '../utils/response.util';

export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    getUserConversations = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = (req as any).user.userId;
        const conversations = await this.conversationService.getUserConversations(userId);
        ResponseUtil.success(res, conversations, 'Conversations retrieved');
    };

    createDirectConversation = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const currentUserId = (req as any).user.userId;
        const { userId } = req.body;
        const conversation = await this.conversationService.createDirectConversation(
            currentUserId,
            userId
        );
        ResponseUtil.created(res, conversation, 'Conversation created');
    };

    createGroupConversation = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const creatorId = (req as any).user.userId;
        const { name, memberIds } = req.body;
        const conversation = await this.conversationService.createGroupConversation(
            creatorId,
            name,
            memberIds
        );
        ResponseUtil.created(res, conversation, 'Group created');
    };

    getConversationDetails = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const userId = (req as any).user.userId;
        const conversationId = req.params.id as string;
        const conversation = await this.conversationService.getConversationDetails(
            conversationId,
            userId
        );
        ResponseUtil.success(res, conversation, 'Conversation details retrieved');
    };

    addMembers = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const currentUserId = (req as any).user.userId;
        const conversationId = req.params.id as string;
        const { memberIds } = req.body;
        await this.conversationService.addMembers(conversationId, currentUserId, memberIds);
        ResponseUtil.success(res, null, 'Members added');
    };

    removeMember = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
        const currentUserId = (req as any).user.userId;
        const conversationId = req.params.id as string;
        const memberId = req.params.userId as string;
        await this.conversationService.removeMember(conversationId, currentUserId, memberId);
        ResponseUtil.success(res, null, 'Member removed');
    };
}