import { HttpException } from './HttpException';

export class ConflictException extends HttpException {
    constructor(message = 'Resource already exists', errorCode = 'CONFLICT') {
        super(409, message, errorCode);
        Object.setPrototypeOf(this, ConflictException.prototype);
    }
}