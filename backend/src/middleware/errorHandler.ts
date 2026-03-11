import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

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
        res.status(409).json({
            success: false,
            message: "Duplicate field value. This resource already exists.",
        });
        return
    }

    if (err.name === "ValidationError") {

        res.status(400).json({
            success: false,
            message: err.message,
        });
        return
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
    return
};