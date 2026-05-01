import app from './app'
import mongoose from 'mongoose'
import { config } from './config'
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from './chat/socket';
import { logger } from './utils/logger';


const startServer = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI);
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
        httpServer.listen(config.PORT, () => {
            logger.info(`Server connected on port ${config.PORT}`);
        });
    } catch (error) {
        logger.error({ error }, 'Server startup failed');
        process.exit(1);
    }
};

startServer();