import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError("Forbidden", 403);
        }
        next();
    };
};
