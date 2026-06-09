/**
 * Message Routes
 * 
 * Route definitions for message endpoints.
 * Handles Zod validation, wires dependencies via manual DI,
 * and applies authentication middleware.
 */
import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { MessageService } from '../services/MessageService';
import { MessageRepository } from '../repositories/MessageRepository';
import { MessageReceiptRepository } from '../repositories/MessageReceiptRepository';
import { ParticipantRepository } from '../repositories/ParticipantRepository';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { sendMessageSchema, markReadSchema, getMessagesSchema } from '../validators/message.validator';
import { BadRequestException } from '../exceptions/BadRequestException';

const router = Router();

const messageRepository = new MessageRepository();
const messageReceiptRepository = new MessageReceiptRepository();
const participantRepository = new ParticipantRepository();
const conversationRepository = new ConversationRepository();
const messageService = new MessageService(
    messageRepository,
    messageReceiptRepository,
    participantRepository,
    conversationRepository,
);
const messageController = new MessageController(messageService);

router.use(AuthMiddleware.authenticate);

router.get('/conversations/:id/messages', (req, res, next) => {
    const result = getMessagesSchema.safeParse(req.query);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    (req as any).validatedQuery = result.data;
   return messageController.getMessages(req, res, next);
});

router.post('/conversations/:id/messages', (req, res, next) => {
    const result = sendMessageSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    return messageController.sendMessage(req, res, next);
});

router.post('/messages/:id/read', (req, res, next) => {
    const result = markReadSchema.safeParse(req.body);
    if (!result.success) {
        throw new BadRequestException('Validation failed', 'VALIDATION_ERROR', result.error.issues);
    }
    req.body = result.data;
    return messageController.markAsRead(req, res, next);
});

export default router;