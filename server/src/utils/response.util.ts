import { Response } from 'express';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message: string;
    timestamp: string;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export class ResponseUtil {
    static success<T>(
        res: Response,
        data: T,
        message = 'Operation successful',
        statusCode = 200
    ): Response {
        const response: ApiResponse<T> = {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
        };
        return res.status(statusCode).json(response);
    }

    static paginated<T>(
        res: Response,
        data: T[],
        meta: PaginationMeta,
        message = 'Data retrieved successfully'
    ): Response {
        const response: ApiResponse<T[]> = {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString(),
            meta,
        };
        return res.status(200).json(response);
    }

    static created<T>(
        res: Response,
        data: T,
        message = 'Resource created successfully'
    ): Response {
        return this.success(res, data, message, 201);
    }

    static noContent(res: Response, message = 'Resource deleted successfully'): Response {
        const response: ApiResponse = {
            success: true,
            message,
            timestamp: new Date().toISOString(),
        };
        return res.status(204).json(response);
    }

    static error(
        res: Response,
        statusCode: number,
        errorCode: string,
        message: string,
        details?: unknown
    ): Response {
        const response: ApiResponse = {
            success: false,
            message: message,
            timestamp: new Date().toISOString(),
            error: {
                code: errorCode,
                message,
                details,
            },
        };
        return res.status(statusCode).json(response);
    }
}