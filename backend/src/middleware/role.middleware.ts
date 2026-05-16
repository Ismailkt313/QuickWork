import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { HttpStatusCode } from "../constants/httpStatusCode";

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            next(new AppError(`Forbidden: Your role '${req.user?.role}' is not authorized. Expected: ${roles.join(', ')}`, HttpStatusCode.FORBIDDEN));
            return;
        }
        next();
    };
};

