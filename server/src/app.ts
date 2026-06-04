import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.config';
import { initializeDatabase } from './config/database.config';
import { ErrorMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger.util';

class App {
    public app: Application;
    private port: number;

    constructor() {
        this.app = express();
        this.port = env.port;

        this.initializeMiddlewares();
        this.initializeErrorHandling();
    }

    private initializeMiddlewares(): void {
        this.app.use(helmet());

        this.app.use(
            cors({
                origin: env.cors.origin,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
            })
        );

        const limiter = rateLimit({
            windowMs: env.rateLimit.windowMs,
            max: env.rateLimit.maxRequests,
            message: {
                success: false,
                message: 'Too many requests, please try again later',
                error: {
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Rate limit exceeded',
                },
            },
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use(cookieParser());
        this.app.set('trust proxy', 1);

        this.app.get('/health', (_req, res) => {
            res.status(200).json({
                success: true,
                message: 'Nebula Chat server is running',
                timestamp: new Date().toISOString(),
                environment: env.nodeEnv,
            });
        });
    }

    private initializeErrorHandling(): void {
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.method} ${req.path} not found`,
                error: {
                    code: 'ROUTE_NOT_FOUND',
                    message: 'The requested endpoint does not exist',
                },
                timestamp: new Date().toISOString(),
            });
        });

        this.app.use(ErrorMiddleware.handle);
    }

    public async start(): Promise<void> {
        try {
            await initializeDatabase();

            const server = this.app.listen(this.port, () => {
                logger.info(`Nebula Chat server running on port ${this.port}`);
                logger.info(`Environment: ${env.nodeEnv}`);
                logger.info(`Health check: http://localhost:${this.port}/health`);
            });

            this.handleShutdown(server);
        } catch (error) {
            logger.error('Failed to start server', error);
            process.exit(1);
        }
    }

    private handleShutdown(server: any): void {
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down gracefully...`);
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });

            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

const app = new App();
app.start();

export default app;