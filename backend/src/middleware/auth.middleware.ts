import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { ITokenPayload } from "../modules/auth/interfaces/auth.interface";
import { AppError } from "../utils/AppError";
import { UserModel } from "../modules/auth/models/user.model";

declare global {
    namespace Express {
        interface User extends ITokenPayload { }
    }
}

export const authMiddleware = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {

            throw new AppError("Access denied. No token provided.", 401);
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);

        const user = await UserModel.findById(decoded.userId).select("isBlocked");
        if (!user) {
            throw new AppError("User not found", 401);
        }
        if (user.isBlocked) {
            throw new AppError("Your account has been blocked", 403);
        }

        req.user = decoded;
        next();
    } catch (error: any) {

        if (error instanceof AppError) {
            next(error);
            return;
        }
        next(new AppError("Invalid or expired token", 401));
    }
};

