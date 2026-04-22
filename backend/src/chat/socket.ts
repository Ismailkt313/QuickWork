import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { messageService } from "../modules/message";
import { IMessage } from "../modules/message/interface/message.interface";
import { MESSAGE_TYPE } from "../constants/message";

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
        } catch (error) {
            return next(new Error("Authentication error"));
        }
    })

    io.on("connection", (socket: Socket) => {
        const userId = socket.data.user.userId || socket.data.user.id;
        
        socket.join(userId);
        console.log(`[Socket] User joined room: ${userId}`);
        
        socket.on('disconnect', (reason) => {
            console.log(`[Socket] User disconnected: ${socket.id} (Reason: ${reason})`);
        })
    })
  } catch (error: any) {
    console.error("ERROR AT socket.ts:", error.message);
  }
}

export const getIo = () => io; 