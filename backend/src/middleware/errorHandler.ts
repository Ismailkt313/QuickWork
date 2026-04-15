import e, { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "../constants/httpStatusCode";


export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
): any => {

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
            message: "Duplicate field value. This resource already exists.",
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

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `${err.message} - Internal server error`,
        console: err.message,
    });
    return
};