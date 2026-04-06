import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { messageService } from "../modules/message";
import { IMessage } from "../modules/message/interface/message.interface";

export const setupSocket = (io: Server) => {
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
        console.log("a user connected", socket.id);
        const userId = socket.data.user.userId || socket.data.user.id;
        console.log("socket user data:", socket.data.user);
        console.log("user id", userId);
        socket.join(userId);
        socket.on('sendMessage', async (data: { receiverId: string, message: string }) => {
            const { receiverId, message } = data;
            if (!message.trim() || !receiverId) {
                return;
            }
            const senderId = socket.data.user.userId || socket.data.user.id;
            console.log("message sent", data);

            const messageData: IMessage = {
                sender: senderId,
                receiver: receiverId,
                message: message,
                conversationId: "",
                messageType: "text",
                isRead: false
            };

            try {
                const savedMessage = await messageService.createMessage(messageData);
                io.to(receiverId).emit('receiveMessage', savedMessage);
                io.to(senderId).emit('receiveMessage', savedMessage);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        })
        socket.on('disconnect', () => {
            console.log("user disconnected", socket.id);
        })
    })
} 