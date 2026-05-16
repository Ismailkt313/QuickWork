import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

type RequestWithCustomProps = Request & {
    log?: typeof logger;
    requestId?: string;
    user?: { userId?: string; id?: string; _id?: string; sub?: string };
};

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {

    if (req.method === "OPTIONS") {
        return next();
    }

    const requestId = (req.headers["x-request-id"] as string) || randomUUID();

    const startTime = Date.now();

    res.setHeader("x-request-id", requestId);

    const childLogger = logger.child({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
    });

    (req as RequestWithCustomProps).log = childLogger;
    (req as RequestWithCustomProps).requestId = requestId;

    childLogger.info({
        msg: "Incoming Request",
        body: req.body,
        query: req.query,
        params: req.params,
    });

    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const user = (req as RequestWithCustomProps).user;
        const userId = user?.userId || user?.id || user?._id || user?.sub;

        childLogger.info({
            msg: "Request Completed",
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userId: userId || "unauthenticated",
        });
    });

    next();
};
