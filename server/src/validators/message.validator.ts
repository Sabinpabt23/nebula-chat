/**
 * Message Validators
 * 
 * Zod validation schemas for message-related endpoints.
 * Validates message content and type for sending messages.
 */
import { z } from 'zod';

export const sendMessageSchema = z.object({
    content: z
        .string()
        .min(1, 'Message content is required')
        .max(5000, 'Message must not exceed 5000 characters'),
    messageType: z
        .enum(['TEXT', 'IMAGE', 'FILE'])
        .default('TEXT'),
});

export const markReadSchema = z.object({
    messageId: z
        .string()
        .uuid('Invalid message ID'),
});

export const getMessagesSchema = z.object({
    page: z
        .string()
        .transform((val: string) => parseInt(val, 10))
        .pipe(z.number().min(1))
        .optional(),
    limit: z
        .string()
        .transform((val: string) => parseInt(val, 10))
        .pipe(z.number().min(1).max(100))
        .optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;