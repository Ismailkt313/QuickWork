import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { ErrorMessages } from "../constants/messages/errorMessages";
import { logger } from "../utils/logger";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const log = (req as any).log || logger;

    const errorDetails = {
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
        code: err.code,
        name: err.name,
        path: req.path,
        method: req.method,
    };

    if (err instanceof AppError) {
        log.warn({ ...errorDetails, msg: "Application Error" });
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    if (err.code === 11000) {
        log.warn({ ...errorDetails, msg: "Duplicate Key Error" });
        res.status(HttpStatusCode.CONFLICT).json({
            success: false,
            message: ErrorMessages.RESOURCE_ALREADY_EXISTS,
        });
        return;
    }

    if (err.name === "ValidationError") {
        log.warn({ ...errorDetails, msg: "Validation Error" });
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: err.message,
        });
        return;
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        log.warn({ ...errorDetails, msg: "File Size Limit Exceeded" });
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "File is too large. Maximum size is 5MB.",
        });
        return;
    }

    if (err.name === "MulterError") {
        log.warn({ ...errorDetails, msg: "Multer Error" });
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
        return;
    }

    log.error({ ...errorDetails, msg: "Unhandled Exception" });
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
    });
};