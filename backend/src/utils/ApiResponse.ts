import { Response } from 'express';
import { HttpStatusCode } from '../constants/httpStatusCode';

export interface IPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    counts?: Record<string, number>;
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: IPaginationMeta;
    error?: unknown;
    total?: number;
    page?: number;
    limit?: number;
    counts?: Record<string, number>;
    [key: string]: unknown;
}

export class ApiResponse {
    public static sendSuccess<T>(
        res: Response,
        data: T,
        message?: string,
        statusCode: number = HttpStatusCode.OK,
        additionalMeta?: Record<string, unknown>
    ): Response {
        const responsePayload: IApiResponse<T> = {
            success: true,
            message,
            data,
            ...additionalMeta
        };

        if (message === undefined) delete responsePayload.message;
        if (data === undefined) delete responsePayload.data;

        return res.status(statusCode).json(responsePayload);
    }

    public static sendPagination<T>(
        res: Response,
        data: T,
        paginationMeta: IPaginationMeta,
        message?: string,
        statusCode: number = HttpStatusCode.OK,
        additionalMeta?: Record<string, unknown>
    ): Response {
        const totalPages = Math.ceil(paginationMeta.total / paginationMeta.limit) || 1;
        const enrichedPagination: IPaginationMeta = {
            ...paginationMeta,
            totalPages,
            hasNextPage: paginationMeta.page < totalPages,
            hasPrevPage: paginationMeta.page > 1
        };

        const responsePayload: IApiResponse<T> = {
            success: true,
            message,
            data,
            pagination: enrichedPagination,
            total: paginationMeta.total,
            page: paginationMeta.page,
            limit: paginationMeta.limit,
            counts: paginationMeta.counts,
            ...additionalMeta
        };

        if (message === undefined) delete responsePayload.message;

        return res.status(statusCode).json(responsePayload);
    }

    public static sendError(
        res: Response,
        message: string,
        statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
        errorDetails?: unknown
    ): Response {
        const responsePayload: IApiResponse<null> = {
            success: false,
            message,
            error: errorDetails || message
        };

        return res.status(statusCode).json(responsePayload);
    }
}
