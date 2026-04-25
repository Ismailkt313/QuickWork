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
        const io = new Server(httpServer,{
            cors:{
                origin: [
          config.FRONTEND_URL,
          "https://quick-work-lemon.vercel.app"
        ],
                credentials:true,
                methods:["GET","POST"],
            }
        });
        setupSocket(io);
        httpServer.listen(config.PORT, () => {
            logger.info(`Server connected on port ${config.PORT}`);
        });
    } catch (error) {
        logger.error({ error }, 'Server startup failed');
        process.exit(1);
    }
};

startServer();