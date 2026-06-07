/**
 * Conversation Routes
 * 
 * Route definitions for conversation endpoints.
 * Handles Zod validation, wires dependencies via manual DI,
 * and applies authentication middleware.
 */
import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController';
import { ConversationService } from '../services/ConversationService';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { ParticipantRepository } from '../repositories/ParticipantRepository';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { createDirectConversationSchema, createGroupConversationSchema, addMembersSchema } from '../validators/conversation.validator';
import { BadRequestException } from '../exceptions/BadRequestException';

const router = Router();

const conversationRepository = new ConversationRepository();
const participantRepository = new ParticipantRepository();
const conversationService = new ConversationService(conversationRepository, participantRepository);
const conversationController = new ConversationController(conversationService);

router.use(AuthMiddleware.authenticate);

router.get('/', (req, res, next) => {
    conversationController.getUserConversations(req, res, next);
});

router.post('/dm', (req, res, next) => {
    const result = createDirectConversationSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    conversationController.createDirectConversation(req, res, next);
});

router.post('/group', (req, res, next) => {
    const result = createGroupConversationSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    conversationController.createGroupConversation(req, res, next);
});

router.get('/:id', (req, res, next) => {
    conversationController.getConversationDetails(req, res, next);
});

router.post('/:id/members', (req, res, next) => {
    const result = addMembersSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    conversationController.addMembers(req, res, next);
});

router.delete('/:id/members/:userId', (req, res, next) => {
    conversationController.removeMember(req, res, next);
});

export default router;