import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export interface RequestWithRequestId extends Request {
    requestId?: string;
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = (req.headers["x-request-id"] as string) || randomUUID();
    (req as RequestWithRequestId).requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
};
