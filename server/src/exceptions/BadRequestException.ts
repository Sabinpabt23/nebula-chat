import { HttpException } from './HttpException';

export class BadRequestException extends HttpException {
    constructor(message = 'Bad request', errorCode = 'BAD_REQUEST', details?: unknown) {
        super(400, message, errorCode, details);
        Object.setPrototypeOf(this, BadRequestException.prototype);
    }
}