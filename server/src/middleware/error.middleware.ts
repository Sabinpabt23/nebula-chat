/**
 * Global Error Handling Middleware
 * * @module middleware/error
 * * @description
 * The catch-all safety net for application runtime exceptions. This terminal Express 
 * middleware intercepts unhandled errors upstream (from controllers, services, or DB layers),
 * logs comprehensive contextual diagnostics, and sanitizes API output into standard JSON payloads.
 * * Operational Architecture Roles:
 * 1. Log Diagnostics    — Captures full runtime traces, HTTP pathing, method types, and client IPs via {@link logger}.
 * 2. Type Discrimination — Identifies custom `HttpException` variants and returns their pre-configured status/error structures.
 * 3. Parser Normalization— Intercepts `ZodError` exceptions, formatting complex structural validation issues into client-friendly field logs.
 * 4. Fallback Protection — Handles untracked 500 errors. In production environments, it automatically sanitizes data to conceal system-level call stacks.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpException } from '../exceptions/HttpException';
import { logger } from '../utils/logger.util';

export class ErrorMiddleware {
    /**
     * Intercepts threw exceptions and transmits a structured HTTP client response.
     * * @param {Error} error - The uncaught runtime exception instance.
     * @param {Request} req - Express Request context (used to audit error pathways).
     * @param {Response} res - Express Response context (used to dispatch standardized payloads).
     * @param {NextFunction} _next - Express lifecycle modifier (unused as this interceptor is terminal).
     * @returns {void}
     */
    static handle(error: Error, req: Request, res: Response, _next: NextFunction): void {
        logger.error('Error occurred', {
            error: error.message,
            stack: error.stack,
            path: req.path,
            method: req.method,
            ip: req.ip,
        });

        // 1. Handle Known Domain Exceptions (Custom HttpExceptions)
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

        // 2. Handle Schema Request Body Validation Failures (Zod Validation)
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

        // 3. Handle Untracked/Unknown Crash Scenarios (500 Internal Server Errors)
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