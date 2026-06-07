/**
 * User Validators
 * 
 * Zod validation schemas for user-related endpoints.
 * Validates and transforms incoming request data before it reaches controllers.
 * 
 * Schemas:
 * - updateProfileSchema: Validates display name (2-100 chars) and avatar URL
 * - searchUsersSchema: Validates search query with optional pagination limit
 */
import { z } from 'zod';

export const updateProfileSchema = z.object({
    displayName: z
        .string()
        .min(2, 'Display name must be at least 2 characters')
        .max(100, 'Display name must not exceed 100 characters')
        .optional(),
    avatarUrl: z
        .string()
        .url('Invalid avatar URL')
        .optional(),
});

export const searchUsersSchema = z.object({
    query: z
        .string()
        .min(1, 'Search query is required')
        .max(255, 'Search query too long'),
    limit: z
        .string()
        .transform((val: string) => parseInt(val, 10))
        .pipe(z.number().min(1).max(100))
        .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;