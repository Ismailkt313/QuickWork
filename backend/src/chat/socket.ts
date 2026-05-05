import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.util";
import { logger } from "../utils/logger";
import { UserModel } from "../modules/auth/models/user.model";


let io: Server;

export const setupSocket = (socketIo: Server) => {
  try {
      io = socketIo;
    io.use(async (socket: Socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        try {
            const rawToken = token as string;
            const cleanToken = rawToken.startsWith("Bearer ") ? rawToken.split(" ")[1] : rawToken;
            const decoded = verifyAccessToken(cleanToken.trim());
            
            const user = await UserModel.findById(decoded.userId).select("isBlocked");
            if (!user) {
                return next(new Error("User not found"));
            }
            if (user.isBlocked) {
                return next(new Error("Your account has been blocked"));
            }

            socket.data.user = decoded;
            next();
        } catch (error:any) {
            logger.warn({ error: error.message }, "Socket auth failed");
            return next(new Error("Authentication error: " + error.message));
        }
    })

    io.on("connection", (socket: Socket) => {
        const userId = String(socket.data.user.userId || socket.data.user.id || socket.data.user._id).trim();
        
        socket.join(userId);
        logger.info({ userId, socketId: socket.id }, "User joined socket room");
        
        socket.on('disconnect', (reason) => {
            logger.info({ userId, socketId: socket.id, reason }, "User disconnected from socket");
        });

        socket.on("error", (error) => {
            logger.error({ userId, error: error.message }, "Socket error occurred");
        });
    })
  } catch (error: any) {
    logger.error({ error: error.message }, "Error in socket setup");
  }
}

export const getIo = () => io;