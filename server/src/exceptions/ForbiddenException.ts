import { HttpException } from './HttpException';

export class ForbiddenException extends HttpException {
    constructor(message = 'Access denied', errorCode = 'FORBIDDEN') {
        super(403, message, errorCode);
        Object.setPrototypeOf(this, ForbiddenException.prototype);
    }
}