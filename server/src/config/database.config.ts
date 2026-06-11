/**
 * @fileoverview Database Configuration and Initialization Module
 * @module config/database
 */

import { DataSource } from 'typeorm';
import { env } from './env.config';
import { logger } from '../utils/logger.util';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: env.database.url,
    ssl: env.database.ssl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
    entities: env.nodeEnv === 'production'
        ? ['dist/entities/**/*.js']
        : ['src/entities/**/*.ts'],
    migrations: env.nodeEnv === 'production'
        ? ['dist/migrations/**/*.js']
        : ['src/migrations/**/*.ts'],
    subscribers: [],
});

export async function initializeDatabase(): Promise<void> {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection established successfully');
    } catch (error) {
        logger.error('Failed to connect to database', error);
        throw error;
    }
}