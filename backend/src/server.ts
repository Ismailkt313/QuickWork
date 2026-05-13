import app from './app'
import mongoose from 'mongoose'
import { config } from './config'
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from './chat/socket';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        logger.info('Database connected successfully');
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
            logger.info(`Server connected on port ${config.PORT}`);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received. Starting graceful shutdown...`);
            
            server.close(async () => {
                logger.info('HTTP server closed.');
                
                try {
                    if (io) {
                        await new Promise<void>((resolve) => {
                            io.close(() => {
                                logger.info('Socket.IO server closed.');
                                resolve();
                            });
                        });
                    }

                    await mongoose.connection.close();
                    logger.info('MongoDB connection closed.');
                    
                    process.exit(0);
                } catch (err) {
                    logger.error({ err }, 'Error during graceful shutdown');
                    process.exit(1);
                }
            });

            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (error) {
        logger.error({ error }, 'Server startup failed');
        process.exit(1);
    }
};

startServer();
