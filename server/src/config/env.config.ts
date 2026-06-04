import dotenv from 'dotenv';

// Load .env file
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

function getEnvVar(key: string, required = true): string {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || '';
}

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