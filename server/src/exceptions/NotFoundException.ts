import { HttpException } from './HttpException';

export class NotFoundException extends HttpException {
    constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
        super(404, message, errorCode);
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
}