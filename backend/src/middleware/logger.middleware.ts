import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Skip logging for CORS preflight requests
    if (req.method === "OPTIONS") {
        return next();
    }

    const requestId = (req.headers["x-request-id"] as string) || randomUUID();

    const startTime = Date.now();

    // Attach requestId to response headers
    res.setHeader("x-request-id", requestId);

    // Create a child logger with request context
    // We'll attach it to the request object so it can be used in controllers/services
    const childLogger = logger.child({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
    });

    // Extend Request type locally (or use a d.ts file)
    (req as any).log = childLogger;
    (req as any).requestId = requestId;

    // Log the incoming request
    childLogger.info({
        msg: "Incoming Request",
        body: req.body,
        query: req.query,
        params: req.params,
    });

    // Log response when finished
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const userId = (req as any).user?.id || (req as any).user?._id;

        childLogger.info({
            msg: "Request Completed",
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: userId || "unauthenticated",
        });
    });

    next();
};
