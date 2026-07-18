import winston from "winston";
import { ILogger } from "../interfaces/ILogger";
import { getTransports } from "./transports";

export class WinstonLogger implements ILogger {
    private logger: winston.Logger;

    constructor() {
        const isDev = process.env.NODE_ENV !== "production";
        this.logger = winston.createLogger({
            level: isDev ? "debug" : "info",
            transports: getTransports(isDev),
            exitOnError: false,
        });
    }

    public info(message: string, metadata?: Record<string, any>): void {
        this.logger.info(message, metadata);
    }

    public warn(message: string, metadata?: Record<string, any>): void {
        this.logger.warn(message, metadata);
    }

    public error(message: string, metadata?: Record<string, any>): void {
        this.logger.error(message, metadata);
    }

    public debug(message: string, metadata?: Record<string, any>): void {
        this.logger.debug(message, metadata);
    }
}
