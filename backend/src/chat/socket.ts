import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { logger } from "../utils/logger";


let io: Server;

export const setupSocket = (socketIo: Server) => {
  try {
      io = socketIo;
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const cleanToken = (token as string).startsWith("Bearer ") ? (token as string).split(" ")[1] : token;
            const decoded = jwt.verify(cleanToken, config.JWT_ACCESS_SECRET) as any;
            socket.data.user = decoded;
            next();
        } catch (error:any) {
            return next(new Error("Authentication error"+error.message));
        }
    })

    io.on("connection", (socket: Socket) => {
        const userId = socket.data.user.userId || socket.data.user.id;
        
        socket.join(userId);
        logger.info({ userId, socketId: socket.id }, "User joined socket room");
        
        socket.on('disconnect', (reason) => {
            logger.info({ userId, socketId: socket.id, reason }, "User disconnected from socket");
        })
    })
  } catch (error: any) {
    logger.error({ error: error.message }, "Error in socket setup");
  }
}

export const getIo = () => io;