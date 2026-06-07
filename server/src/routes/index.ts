/**
 * Route Aggregator
 * 
 * Central point that combines all route modules and mounts them
 * under the /api/v1 prefix. Add new route modules here as they are created.
 */
import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import conversationRoutes from './conversation.routes';
import messageRoutes from './message.routes';
import groupRoutes from './group.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/groups', groupRoutes);
router.use('/', messageRoutes);

export default router;