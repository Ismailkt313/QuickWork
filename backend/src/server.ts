import app from './app'
import mongoose from 'mongoose'
import { config } from './config'
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from './chat/socket';
import { appLogger } from './shared/logger';

process.on('uncaughtException', (error) => {
    appLogger.error("Unexpected Exception", { stack: error.stack, error });
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    appLogger.error("Unhandled Promise Rejection", { stack: error.stack, error });
});

const startServer = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        appLogger.info('Database connected successfully');
        const httpServer = http.createServer(app);
        const io = new Server(httpServer, {
            cors: {
                origin: true,
                credentials: true,
                methods: ["GET", "POST"],
            },
            transports: ["websocket", "polling"],
            allowEIO3: true,
            pingTimeout: 60000,
            pingInterval: 25000
        });
        setupSocket(io);
        app.set("io", io);
        const server = httpServer.listen(config.PORT, () => {
            appLogger.info(`Server connected on port ${config.PORT}`);
        });

        const gracefulShutdown = async (signal: string) => {
            appLogger.info(`${signal} received. Starting graceful shutdown...`);
            
            server.close(async () => {
                appLogger.info('HTTP server closed.');
                
                try {
                    if (io) {
                        await new Promise<void>((resolve) => {
                            io.close(() => {
                                appLogger.info('Socket.IO server closed.');
                                resolve();
                            });
                        });
                    }

                    await mongoose.connection.close();
                    appLogger.info('MongoDB connection closed.');
                    
                    process.exit(0);
                } catch (err: any) {
                    appLogger.error('Error during graceful shutdown', { err: err?.message, stack: err?.stack });
                    process.exit(1);
                }
            });

            setTimeout(() => {
                appLogger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (error: any) {
        appLogger.error('Server startup failed', { error: error?.message, stack: error?.stack });
        process.exit(1);
    }
};

startServer();

