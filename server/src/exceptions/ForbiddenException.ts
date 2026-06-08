/**
 * Forbidden Exception (403 Forbidden)
 * * Specialized HTTP exception class explicitly thrown when an authenticated user 
 * attempts to execute operations on resources they do not possess permissions to access.
 * * Structural Purpose:
 * standardizes 403-level security barriers sent back to clients. It handles situations 
 * where identity is known (the user is logged in), but structural access criteria are not 
 * satisfied (e.g., a standard participant trying to add members to a group chat without an ADMIN role).
 * * Key Inherited Blueprint:
 * - statusCode : 403 (Fixed HTTP Specification Value)
 * - message    : Human-readable error message (Defaults to 'Access denied')
 * - errorCode  : Machine-readable uppercase string key for UI security switches (Defaults to 'FORBIDDEN')
 * * Technical Caveat:
 * `Object.setPrototypeOf(this, ForbiddenException.prototype)` explicitly repairs the 
 * prototype chain, which natively breaks when extending built-in classes like `Error` in ES5/TypeScript compilation.
 */

import { HttpException } from './HttpException';

export class ForbiddenException extends HttpException {
    constructor(message = 'Access denied', errorCode = 'FORBIDDEN') {
        super(403, message, errorCode);
        Object.setPrototypeOf(this, ForbiddenException.prototype);
    }
}