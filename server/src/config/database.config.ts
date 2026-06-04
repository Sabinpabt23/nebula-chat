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