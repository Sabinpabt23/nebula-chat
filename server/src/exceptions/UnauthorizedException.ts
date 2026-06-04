import { HttpException } from './HttpException';

export class UnauthorizedException extends HttpException {
    constructor(message = 'Authentication required', errorCode = 'UNAUTHORIZED') {
        super(401, message, errorCode);
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }
}