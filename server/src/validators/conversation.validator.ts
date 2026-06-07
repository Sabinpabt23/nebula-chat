/**
 * Conversation Validators
 * 
 * Zod validation schemas for conversation-related endpoints.
 * Validates request data for direct messages, group creation,
 * and member management.
 */
import { z } from 'zod';

export const createDirectConversationSchema = z.object({
    userId: z
        .string()
        .uuid('Invalid user ID'),
});

export const createGroupConversationSchema = z.object({
    name: z
        .string()
        .min(1, 'Group name is required')
        .max(100, 'Group name must not exceed 100 characters'),
    memberIds: z
        .array(z.string().uuid('Invalid user ID'))
        .min(1, 'At least one member is required'),
});

export const addMembersSchema = z.object({
    memberIds: z
        .array(z.string().uuid('Invalid user ID'))
        .min(1, 'At least one member is required'),
});

export type CreateDirectConversationInput = z.infer<typeof createDirectConversationSchema>;
export type CreateGroupConversationInput = z.infer<typeof createGroupConversationSchema>;
export type AddMembersInput = z.infer<typeof addMembersSchema>;