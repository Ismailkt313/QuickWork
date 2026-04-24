import e, { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "../constants/httpStatusCode";
import { ErrorMessages } from "../constants/messages/errorMessages";


export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    if (err instanceof AppError) {

        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return
    }

    if (err.code === 11000) {
        res.status(HttpStatusCode.CONFLICT).json({
            success: false,
            message: ErrorMessages.RESOURCE_ALREADY_EXISTS,
        });
        return
    }

    if (err.name === "ValidationError") {

        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: err.message,
        });
        return
    }

    if (err.code === "LIMIT_FILE_SIZE") {
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "File is too large. Maximum size is 5MB.",
        });
        return
    }

    if (err.name === "MulterError") {
        res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
        return
    }

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ErrorMessages.INTERNAL_SERVER_ERROR,
        console: err.message,
    });
    return
};