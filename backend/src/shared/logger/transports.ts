import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");

const infoWarnFilter = winston.format((info) => {
    return info.level === "info" || info.level === "warn" ? info : false;
});

const errorFilter = winston.format((info) => {
    return info.level === "error" ? info : false;
});

export const getTransports = (isDev: boolean): winston.transport[] => {
    const transports: winston.transport[] = [
        new DailyRotateFile({
            filename: path.join(LOG_DIR, "application-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "2d",
            level: "info",
            format: winston.format.combine(
                infoWarnFilter(),
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        new DailyRotateFile({
            filename: path.join(LOG_DIR, "error-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "2d",
            level: "error",
            format: winston.format.combine(
                errorFilter(),
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ];

    if (isDev) {
        transports.push(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
                        const metaStr = Object.keys(metadata).length
                            ? ` ${JSON.stringify(metadata)}`
                            : "";
                        return `[${timestamp}] ${level}: ${message}${metaStr}`;
                    })
                ),
            })
        );
    }

    return transports;
};
