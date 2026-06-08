/**
 * @fileoverview Centralized Environment Configuration Module
 * @module config/env
 * * @description
 * This module is the single source of truth for application configuration. It loads 
 * raw strings from `process.env` (via dotenv), parses them into proper types (numbers, booleans),
 * and structures them into a strongly-typed, immutable `env` object.
 * * @fail_fast_policy
 * To prevent the application from running in a partially configured or unstable state,
 * this file will intentionally throw a runtime error during the application boot phase 
 * if any required environment variable is missing.
 * * @developer_guide
 * When adding a new environment variable:
 * 1. Add its key and expected type to the `EnvConfig` interface.
 * 2. Map it in the `env` export using `getEnvVar('KEY_NAME', isRequired)`.
 * 3. Remember to update the root `.env.example` file for the team.
 */

import dotenv from 'dotenv';

// Load .env file into process.env at runtime
dotenv.config();

/**
 * Structural contract for the application's configuration layout.
 */
interface EnvConfig {
    nodeEnv: string;
    port: number;
    database: {
        url: string;
        ssl: boolean;
    };
    redis: {
        url: string;
        token?: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiry: string;
        refreshExpiry: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    email: {
        from: string;
        host: string;
        port: number;
        user: string;
        pass: string;
        provider: string;
    };
    cors: {
        origin: string;
    };
    cookie: {
        domain: string;
        secure: boolean;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    logLevel: string;
}

/**
 * Helper utility to extract variables from process.env with integrated validation.
 * * @param {string} key - The exact name of the environment variable.
 * @param {boolean} [required=true] - If true, missing variables will halt application execution.
 * @throws {Error} If `required` is true and the variable is missing/empty.
 * @returns {string} The resolved environment value or an empty string.
 */
function getEnvVar(key: string, required = true): string {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || '';
}

/**
 * Frozen, type-safe application configuration instance.
 * Consumed globally across the codebase instead of direct `process.env` lookups.
 */
export const env: EnvConfig = {
    nodeEnv: getEnvVar('NODE_ENV', false) || 'development',
    port: parseInt(getEnvVar('PORT', false) || '4000', 10),
    database: {
        url: getEnvVar('DATABASE_URL'),
        ssl: getEnvVar('DATABASE_SSL') === 'true',
    },
    redis: {
        url: getEnvVar('REDIS_URL'),
        token: getEnvVar('REDIS_TOKEN', false) || undefined,
    },
    jwt: {
        accessSecret: getEnvVar('JWT_ACCESS_SECRET'),
        refreshSecret: getEnvVar('JWT_REFRESH_SECRET'),
        accessExpiry: getEnvVar('JWT_ACCESS_EXPIRY', false) || '15m',
        refreshExpiry: getEnvVar('JWT_REFRESH_EXPIRY', false) || '7d',
    },
    google: {
        clientId: getEnvVar('GOOGLE_CLIENT_ID', false) || '',
        clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET', false) || '',
        callbackUrl: getEnvVar('GOOGLE_CALLBACK_URL', false) || '',
    },
    email: {
        from: getEnvVar('EMAIL_FROM', false) || 'noreply@nebula-chat.com',
        host: getEnvVar('EMAIL_HOST', false) || 'localhost',
        port: parseInt(getEnvVar('EMAIL_PORT', false) || '1026', 10),
        user: getEnvVar('EMAIL_USER', false) || '',
        pass: getEnvVar('EMAIL_PASS', false) || '',
        provider: getEnvVar('EMAIL_PROVIDER', false) || 'smtp',
    },
    cors: {
        origin: getEnvVar('CORS_ORIGIN', false) || 'http://localhost:5173',
    },
    cookie: {
        domain: getEnvVar('COOKIE_DOMAIN', false) || 'localhost',
        secure: getEnvVar('COOKIE_SECURE') === 'true',
    },
    rateLimit: {
        windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', false) || '900000', 10),
        maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', false) || '100', 10),
    },
    logLevel: getEnvVar('LOG_LEVEL', false) || 'info',
};