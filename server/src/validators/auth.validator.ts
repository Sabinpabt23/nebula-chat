import { z } from 'zod';

export const sendOtpSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .transform((email) => email.toLowerCase().trim()),
});

export const verifyOtpSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .transform((email) => email.toLowerCase().trim()),
    code: z
        .string()
        .length(6, 'OTP must be 6 digits')
        .regex(/^\d+$/, 'OTP must contain only digits'),
});

export const googleAuthSchema = z.object({
    credential: z
        .string()
        .min(1, 'Google credential is required'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;