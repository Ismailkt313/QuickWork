import { Request, Response } from "express";
import { IMessageController, IMessageService } from "../interface/message.interface";
import { CreateMessageDto, ConversationIdDto, MessageIdDto } from "../dto/message.request.dto";
import { MESSAGE_TYPE } from "../../../constants/message";

export class MessageController implements IMessageController {
    private messageService: IMessageService;
    constructor(
        messageService: IMessageService
    ) {
        this.messageService = messageService
    }
    async createMessage(req: Request, res: Response): Promise<void> {
        try {
            const senderId = (req as any).user?.userId || (req as any).user?._id;
            if (!senderId) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const dto = CreateMessageDto.create(req.body);

            const result = await this.messageService.createMessage({
                sender: senderId,
                receiver: dto.receiverId,
                message: dto.message,
                messageType: dto.messageType || MESSAGE_TYPE.TEXT,
                conversationId: dto.conversationId || "",
                isRead: false
            });

            res.status(201).json({
                success: true,
                message: "Message created successfully",
                data: result
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this.messageService.getMessages(dto.conversationId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async getConversations(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId || (req as any).user?._id;
            console.log("DEBUG: Controller fetching conversations for userId:", userId);
            
            if (!userId) {
                console.error("DEBUG: No userId found in req.user");
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            console.log("DEBUG: Calling messageService.getConversations...");
            const result = await this.messageService.getConversations(userId);
            console.log("DEBUG: messageService.getConversations result count:", result.length);
            
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            console.error("ERROR AT Controller.getConversations:", error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async getConversation(req: Request, res: Response): Promise<void> {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this.messageService.getConversation(dto.conversationId);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async deleteMessage(req: Request, res: Response): Promise<void> {
        try {
            const dto = MessageIdDto.create(req.query);
            const result = await this.messageService.deleteMessage(dto.messageId);
            res.status(200).json({ success: true, message: "Message deleted", data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async deleteConversation(req: Request, res: Response): Promise<void> {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this.messageService.deleteConversation(dto.conversationId);
            res.status(200).json({ success: true, message: "Conversation deleted", data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
}