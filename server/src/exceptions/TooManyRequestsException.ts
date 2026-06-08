/**
 * Too Many Requests Exception (429 Too Many Requests)
 * * Specialized HTTP exception class explicitly thrown when a client has sent 
 * too many requests in a given amount of time ("rate limiting").
 * * Structural Purpose:
 * Standardizes 429-level traffic management throttling responses sent back to clients. 
 * This acts as an application-layer defense system against brute-force attacks, denial-of-service 
 * (DoS) attempts, or generic api scraping abuses by misconfigured client integrations.
 * * Key Inherited Blueprint:
 * - statusCode : 429 (Fixed HTTP Specification Value)
 * - message    : Human-readable error message (Defaults to 'Too many requests, please try again later')
 * - errorCode  : Machine-readable uppercase string key used to lock UI actions or trigger countdown timers (Defaults to 'TOO_MANY_REQUESTS')
 * * Technical Caveat:
 * `Object.setPrototypeOf(this, TooManyRequestsException.prototype)` explicitly repairs the 
 * prototype chain, which natively breaks when extending built-in classes like `Error` in ES5/TypeScript compilation.
 */

import { HttpException } from './HttpException';

export class TooManyRequestsException extends HttpException {
    constructor(message = 'Too many requests, please try again later', errorCode = 'TOO_MANY_REQUESTS') {
        super(429, message, errorCode);
        Object.setPrototypeOf(this, TooManyRequestsException.prototype);
    }
}