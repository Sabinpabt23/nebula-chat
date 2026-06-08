/**
 * Bad Request Exception (400 Bad Request)
 * * Specialized HTTP exception class explicitly thrown when an incoming request 
 * contains malformed syntax, invalid request payloads, or violates basic domain validation rules.
 * * Structural Purpose:
 * standardizes 400-level error diagnostics sent back to clients. It ensures client-side 
 * forms or UI validation layers receive readable, structured field errors without leaking 
 * internal execution stacks.
 * * Key Inherited Blueprint:
 * - statusCode : 400 (Fixed HTTP Specification Value)
 * - message    : Human-readable error message (Defaults to 'Bad request')
 * - errorCode  : Machine-readable uppercase string key for client-side switch cases (Defaults to 'BAD_REQUEST')
 * - details    : Optional dynamic metadata payload (e.g., Zod/Joi field validation error arrays)
 * * Technical Caveat:
 * `Object.setPrototypeOf(this, BadRequestException.prototype)` explicitly repairs the 
 * prototype chain, which natively breaks when extending built-in classes like `Error` in ES5/TypeScript compilation.
 */

import { HttpException } from './HttpException';

export class BadRequestException extends HttpException {
    constructor(message = 'Bad request', errorCode = 'BAD_REQUEST', details?: unknown) {
        super(400, message, errorCode, details);
        Object.setPrototypeOf(this, BadRequestException.prototype);
    }
}