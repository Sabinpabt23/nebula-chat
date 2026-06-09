/**
 * Group Routes
 * 
 * Route definitions for group and notification endpoints.
 * Handles wiring via manual DI and applies authentication middleware.
 */
import { Router } from 'express';
import { GroupController } from '../controllers/GroupController';
import { ConversationService } from '../services/ConversationService';
import { NotificationService } from '../services/NotificationService';
import { ConversationRepository } from '../repositories/ConversationRepository';
import { ParticipantRepository } from '../repositories/ParticipantRepository';
import { MessageReceiptRepository } from '../repositories/MessageReceiptRepository';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

const conversationRepository = new ConversationRepository();
const participantRepository = new ParticipantRepository();
const messageReceiptRepository = new MessageReceiptRepository();
const conversationService = new ConversationService(conversationRepository, participantRepository);
const notificationService = new NotificationService(
    messageReceiptRepository,
    participantRepository,
    conversationRepository,
);
const groupController = new GroupController(conversationService, notificationService);

router.use(AuthMiddleware.authenticate);

router.get('/unread', (req, res, next) => {
    return groupController.getUnreadCounts(req, res, next);
});

router.get('/:id/unread', (req, res, next) => {
    return groupController.getConversationUnreadCount(req, res, next);
});

export default router;