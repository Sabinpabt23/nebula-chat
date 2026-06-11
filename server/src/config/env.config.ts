/**
 * @fileoverview Centralized Environment Configuration Module
 * @module config/env
 */

import dotenv from 'dotenv';

dotenv.config();

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

function getEnvVar(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
}

export const env: EnvConfig = {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: parseInt(getEnvVar('PORT', '4000'), 10),
    database: {
        url: getEnvVar('DATABASE_URL'),
        ssl: getEnvVar('DATABASE_SSL', 'true') === 'true',
    },
    redis: {
        url: getEnvVar('REDIS_URL'),
        token: getEnvVar('REDIS_TOKEN') || undefined,
    },
    jwt: {
        accessSecret: getEnvVar('JWT_ACCESS_SECRET', 'dev-secret'),
        refreshSecret: getEnvVar('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
        accessExpiry: getEnvVar('JWT_ACCESS_EXPIRY', '15m'),
        refreshExpiry: getEnvVar('JWT_REFRESH_EXPIRY', '7d'),
    },
    google: {
        clientId: getEnvVar('GOOGLE_CLIENT_ID'),
        clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET'),
        callbackUrl: getEnvVar('GOOGLE_CALLBACK_URL'),
    },
    email: {
        from: getEnvVar('EMAIL_FROM', 'noreply@nebula-chat.com'),
        host: getEnvVar('EMAIL_HOST', 'localhost'),
        port: parseInt(getEnvVar('EMAIL_PORT', '1026'), 10),
        user: getEnvVar('EMAIL_USER'),
        pass: getEnvVar('EMAIL_PASS'),
        provider: getEnvVar('EMAIL_PROVIDER', 'smtp'),
    },
    cors: {
        origin: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
    },
    cookie: {
        domain: getEnvVar('COOKIE_DOMAIN', 'localhost'),
        secure: getEnvVar('COOKIE_SECURE', 'false') === 'true',
    },
    rateLimit: {
        windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
        maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    },
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
};