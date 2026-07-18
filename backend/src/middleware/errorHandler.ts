import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { ErrorMessages } from "../constants/messages/errorMessages";
import { appLogger } from "../shared/logger";

interface CustomError extends Error {
    code?: string | number;
    statusCode?: number;
    [key: string]: unknown;
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const user = (req as any).user;
    const userId = user?.userId || user?.id || user?._id || user?.sub;
    const requestId = (req as any).requestId;

    const errorDetails = {
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: userId || undefined,
        requestId: requestId || undefined,
        code: err.code,
        name: err.name,
    };

    if (err instanceof AppError) {
        appLogger.warn(err.message, { ...errorDetails, msg: "Application Error" });
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    if (err.code === 11000) {
        appLogger.warn(err.message, { ...errorDetails, msg: "Duplicate Key Error" });
        res.status(HttpStatusCode.CONFLICT).json({
            success: false,
            message: ErrorMessages.RESOURCE_ALREADY_EXISTS,
        });
        return;
    }

    if (err.name === "ValidationError") {
        appLogger.warn(err.message, { ...errorDetails, msg: "Validation Error" });
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: err.message,
        });
        return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        appLogger.warn(err.message, { ...errorDetails, msg: "File Size Limit Exceeded" });
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "File is too large. Maximum size is 5MB.",
        });
        return;
    }

    if (err.name === "MulterError") {
        appLogger.warn(err.message, { ...errorDetails, msg: "Multer Error" });
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
        return;
    }

    appLogger.error(err.message, { ...errorDetails, msg: "Unhandled Exception" });
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
};