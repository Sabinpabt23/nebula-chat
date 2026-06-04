export abstract class HttpException extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly details?: unknown;

    constructor(statusCode: number, message: string, errorCode: string, details?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        
        // Set the prototype explicitly for instanceof checks
        Object.setPrototypeOf(this, HttpException.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}