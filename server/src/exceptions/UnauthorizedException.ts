/**
 * Unauthorized Exception (401 Unauthorized)
 * * Specialized HTTP exception class explicitly thrown when an incoming request 
 * lacks valid authentication credentials or has provided an expired/invalid session token.
 * * Structural Purpose:
 * Standardizes 401-level identity walls sent back to clients. This acts as the primary 
 * signal to the frontend application that the user's active session has expired or is 
 * completely anonymous, typically prompting an automatic redirect to the login screen.
 * * Key Inherited Blueprint:
 * - statusCode : 401 (Fixed HTTP Specification Value)
 * - message    : Human-readable error message (Defaults to 'Authentication required')
 * - errorCode  : Machine-readable uppercase string key used to clear client storage or wipe session states (Defaults to 'UNAUTHORIZED')
 * * Technical Caveat:
 * `Object.setPrototypeOf(this, UnauthorizedException.prototype)` explicitly repairs the 
 * prototype chain, which natively breaks when extending built-in classes like `Error` in ES5/TypeScript compilation.
 */

import { HttpException } from './HttpException';

export class UnauthorizedException extends HttpException {
    constructor(message = 'Authentication required', errorCode = 'UNAUTHORIZED') {
        super(401, message, errorCode);
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }
}