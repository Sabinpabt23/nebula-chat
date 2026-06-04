import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger.util';

export class ErrorMiddleware {
    static handle(error: Error, req: Request, res: Response, _next: NextFunction): void {
        // Log the error
        logger.error('Error occurred', {
            error: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
            ip: req.ip,
        });

        // Handle known HTTP exceptions
        if (error instanceof HttpException) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
                error: {
                    code: error.errorCode,
                    message: error.message,
                    details: error.details || null,
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Handle Zod validation errors
        if (error instanceof ZodError) {
            const details = error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Invalid request data',
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details,
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Handle unknown errors
        const isProduction = process.env.NODE_ENV === 'production';
        res.status(500).json({
            success: false,
            message: isProduction ? 'An unexpected error occurred' : error.message,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: isProduction ? 'An unexpected error occurred' : error.message,
                details: isProduction ? null : error.stack,
            },
            timestamp: new Date().toISOString(),
        });
    }
}