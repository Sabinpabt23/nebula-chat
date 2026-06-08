/**
 * Not Found Exception (404 Not Found)
 * * Specialized HTTP exception class explicitly thrown when a requested resource 
 * cannot be located or identified on the server.
 * * Structural Purpose:
 * Standardizes 404-level error communication back to the client application. This is 
 * triggered when an entity with a specific identifier does not exist in the database 
 * (e.g., pulling up a non-existent `/conversations/:id` or querying a profile by an unassigned email).
 * * Key Inherited Blueprint:
 * - statusCode : 404 (Fixed HTTP Specification Value)
 * - message    : Human-readable error message (Defaults to 'Resource not found')
 * - errorCode  : Machine-readable uppercase string key for client-side empty-state layouts (Defaults to 'NOT_FOUND')
 * * Technical Caveat:
 * `Object.setPrototypeOf(this, NotFoundException.prototype)` explicitly repairs the 
 * prototype chain, which natively breaks when extending built-in classes like `Error` in ES5/TypeScript compilation.
 */

import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
    constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        super(404, message, errorCode);
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
}