 import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.util";
import { appLogger } from "../shared/logger";
import { UserModel } from "../modules/auth/models/user.model";

let io: Server;
let isInitialized = false;

export const setupSocket = (socketIo: Server) => {
  if (isInitialized) return;
  try {
      io = socketIo;
      isInitialized = true;
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
        } catch (error: unknown) {
            appLogger.warn("Socket auth failed", { error: (error as Error).message });
            return next(new Error("Authentication error: " + (error as Error).message));
        }
    })

    io.on("connection", (socket: Socket) => {
        const userId = String(socket.data.user.userId || socket.data.user.id || socket.data.user._id).trim();

        socket.join(userId);
        appLogger.info("User joined socket room", { userId, socketId: socket.id });

        socket.on('disconnect', (reason) => {
            appLogger.info("User disconnected from socket", { userId, socketId: socket.id, reason });
        });

        socket.on("error", (error) => {
            appLogger.error("Socket error occurred", { userId, error: error.message });
        });
    })
  } catch (error: unknown) {
    appLogger.error("Error in socket setup", { error: (error as Error).message });
  }
}

export const getIo = () => io;