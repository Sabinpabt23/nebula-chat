import winston from 'winston';
import { env } from '@config/env.config';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
        if (stack) {
            return `[${timestamp}] ${level}: ${message}\n${stack}`;
        }
        return `[${timestamp}] ${level}: ${message}`;
    })
);

export const logger = winston.createLogger({
    level: env.logLevel,
    format: logFormat,
    defaultMeta: { service: 'nebula-chat' },
    transports: [
        new winston.transports.Console({
            format: consoleFormat,
        }),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});