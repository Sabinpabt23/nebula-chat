import { HttpException } from './HttpException';

export class TooManyRequestsException extends HttpException {
    constructor(message = 'Too many requests, please try again later', errorCode = 'TOO_MANY_REQUESTS') {
        super(429, message, errorCode);
        Object.setPrototypeOf(this, TooManyRequestsException.prototype);
    }
}