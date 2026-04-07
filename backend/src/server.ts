import app from './app'
import mongoose from 'mongoose'
import { config } from './config'
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from './chat/socket';


const startServer = async (): Promise<void> => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('databse connected')
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
            console.log(`server connected on port ${config.PORT}`)
        });
    } catch (error) {
        console.error('server error occurd',error)
        process.exit(1);
    }
};

startServer(); 