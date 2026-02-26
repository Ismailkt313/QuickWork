import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { ITokenPayload } from "../modules/auth/interfaces/auth.interface";
import { AppError } from "../utils/AppError";

declare global {
    namespace Express {
        interface Request {
            user?: ITokenPayload;
        }
    }
}

export const authMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AppError("Access denied. No token provided.", 401);
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyAccessToken(token);
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError("Invalid or expired token", 401));
    }
};
