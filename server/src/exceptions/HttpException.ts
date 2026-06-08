/**
 * Base HTTP Exception Abstract Class
 * * The core architectural blueprint for all custom operational errors in the application.
 * By extending the native JavaScript `Error` class, it bridges semantic web protocol 
 * status codes with standard backend error interception mechanisms.
 * * Structural Purpose:
 * Enforces a strict, predictable contract for error objects across the entire system.
 * Global error handling middleware can catch any exception extending this class 
 * and convert it automatically into an identical JSON response payload for the frontend.
 * * Fields:
 * - statusCode (NUMBER)  — Standard HTTP Status code (e.g., 400, 401, 403, 404, 409)
 * - errorCode  (VARCHAR) — Machine-readable uppercase identifier string used by front-end routing systems
 * - details    (UNKNOWN) — Optional structural metadata bucket (e.g., nested validation parameter error objects)
 * * Internal Engine Overrides:
 * - `Object.setPrototypeOf`      — Forcefully restores the broken prototype inheritance path caused by runtime compilation transformations.
 * - `Error.captureStackTrace`   — Cleanly records standard stack traces while keeping internal constructor paths hidden from diagnostics logs.
 */

export abstract class HttpException extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly details?: unknown;

    constructor(statusCode: number, message: string, errorCode: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        
        // Set the prototype explicitly for instanceof checks
        Object.setPrototypeOf(this, HttpException.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}