/**
 * Conflict Exception (409 Conflict)
 * * Specialized HTTP exception class explicitly thrown when an incoming mutation request 
 * conflicts with the current structural state of target resources on the server.
 * * Structural Purpose:
 * standardizes 409-level error tracking back to the front-end client application. This is 
 * most commonly triggered by unique constraint database violations (e.g., trying to register 
 * an email that is already taken, or creating a direct message channel that already exists).
 * * Key Inherited Blueprint:
 * - statusCode : 409 (Fixed HTTP Specification Value)
 * - message    : Human-readable error message (Defaults to 'Resource already exists')
 * - errorCode  : Machine-readable uppercase string key for client-side routing/localization (Defaults to 'CONFLICT')
 * * Technical Caveat:
 * `Object.setPrototypeOf(this, ConflictException.prototype)` explicitly repairs the 
 * prototype chain, which natively breaks when extending built-in classes like `Error` in ES5/TypeScript compilation.
 */

import { HttpException } from './HttpException';

export class ConflictException extends HttpException {
    constructor(message = 'Resource already exists', errorCode = 'CONFLICT') {
        super(409, message, errorCode);
        Object.setPrototypeOf(this, ConflictException.prototype);
    }
}