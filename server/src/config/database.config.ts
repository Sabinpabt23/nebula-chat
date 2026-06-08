/**
 * @fileoverview Database Configuration and Initialization Module
 * @module config/database
 * * @description
 * Establishes and manages the TypeORM `DataSource` instance for the PostgreSQL database.
 * This module acts as the data-layer backbone for the application, handling connection 
 * pooling, entity mapping, and migration tracking.
 * * @behavior Environment-Specific Rules:
 * - Development: Enables automated schema synchronization (`synchronize: true`) and verbose logging.
 * - Production: Forces strict migration-based schema updates and restricts logs to critical errors only.
 * * @requires {@link env} - For validated database URLs and runtime environment flags.
 * @requires {@link logger} - For structured, environment-aware application logging.
 */

import { DataSource } from 'typeorm';
import { env } from './env.config';
import { logger } from '../utils/logger.util';

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: env.database.url,
    ssl: env.database.ssl ? { rejectUnauthorized: false } : false,
    synchronize: env.nodeEnv === 'development',
    logging: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
    entities: ['src/entities/**/*.ts'],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: [],
});

/**
 * Initializes the TypeORM DataSource connection pool.
 * Escalates boot-time connection failures to prevent the application from running in a broken state.
 * * @throws {Error} If the database connection cannot be established.
 * @returns {Promise<void>}
 */
export async function initializeDatabase(): Promise<void> {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection established successfully');

        if (env.nodeEnv === 'development') {
            logger.warn('Database synchronize is enabled - NOT for production use');
        }
    } catch (error) {
        logger.error('Failed to connect to database', error);
        throw error;
    }
}