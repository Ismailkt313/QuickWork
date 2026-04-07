import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { messageService } from "../modules/message";
import { IMessage } from "../modules/message/interface/message.interface";
import { MESSAGE_TYPE } from "../constants/message";

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
        const userId = socket.data.user.userId || socket.data.user.id;
        console.log(`[Socket] User connected: ${socket.id} (UserId: ${userId})`);
        
        socket.join(userId);
        console.log(`[Socket] User joined room: ${userId}`);
        socket.on('sendMessage', async (data: { receiverId: string, message: string }) => {
            const { receiverId, message } = data;
            if (!message.trim() || !receiverId) {
                return;
            }
            const senderId = socket.data.user.userId || socket.data.user.id;
            console.log(`[Socket] sendMessage from ${senderId} to ${receiverId}`);

            const messageData: IMessage = {
                sender: senderId,
                receiver: receiverId,
                message: message,
                conversationId: "",
                messageType: MESSAGE_TYPE.TEXT,
                isRead: false
            };

            try {
                const savedMessage = await messageService.createMessage(messageData);
                console.log(`[Socket] Message saved. ConvId: ${savedMessage.conversationId}`);
                io.to(receiverId).emit('receiveMessage', savedMessage);
                io.to(senderId).emit('receiveMessage', savedMessage);
                console.log(`[Socket] Message emitted to rooms: ${receiverId} and ${senderId}`);
            } catch (error) {
                console.error("[Socket] Error saving message:", error);
            }
        })
        socket.on('disconnect', (reason) => {
            console.log(`[Socket] User disconnected: ${socket.id} (Reason: ${reason})`);
        })
    })
} 