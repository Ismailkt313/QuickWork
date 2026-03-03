import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        console.log("authorizeRoles Check -> Expected:", roles, "Actual User:", req.user);
        if (!req.user || !roles.includes(req.user.role)) {
            next(new AppError(`Forbidden: Your role '${req.user?.role}' is not authorized. Expected: ${roles.join(', ')}`, 403));
            return;
        }
        next();
    };
};
