import { Request, Response } from "express";
import { IMessageController, IMessageService } from "../interface/message.interface";
import { CreateMessageDto, ConversationIdDto, MessageIdDto } from "../dto/message.request.dto";
import { MESSAGE_TYPE } from "../../../constants/message";
import { HttpStatusCode } from "../../../constants/httpStatusCode"
import { ErrorMessages } from "../../../constants/messages/errorMessages";
import { SuccessMessages } from "../../../constants/messages/successMessages";
import { getIo } from "../../../chat/socket";


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
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }
            console.log("SENDER ID: ", req.body);
            const dto = CreateMessageDto.create(req.body);

            const result = await this.messageService.createMessage({
                sender: senderId,
                receiver: dto.receiverId,
                text: dto.text,
                image: dto.image,
                messageType: dto.messageType || (dto.image ? MESSAGE_TYPE.IMAGE : MESSAGE_TYPE.TEXT),
                conversationId: dto.conversationId || "",
                isRead: false
            });

            const io = getIo();
            if (io) {
                io.to(dto.receiverId).emit("receiveMessage", result);
                io.to(senderId).emit("receiveMessage", result);
            }

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: SuccessMessages.MESSAGE_CREATED,
                data: result
            });
        } catch (error: any) {
            console.error("ERROR AT Controller.createMessage:", error.message);
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async getMessages(req: Request, res: Response): Promise<void> {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this.messageService.getMessages(dto.conversationId);
            res.status(HttpStatusCode.OK).json({ success: true, data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    
    async getConversations(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId || (req as any).user?._id;
            
            if (!userId) {
                console.error("DEBUG: No userId found in req.user");
                res.status(HttpStatusCode.UNAUTH0RIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }
            const result = await this.messageService.getConversations(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data: result });
        } catch (error: any) {
            console.error("ERROR AT Controller.getConversations:", error);
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async getConversation(req: Request, res: Response): Promise<void> {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this.messageService.getConversation(dto.conversationId);
            res.status(HttpStatusCode.OK).json({ success: true, data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async deleteMessage(req: Request, res: Response): Promise<void> {
        try {
            const dto = MessageIdDto.create(req.query);
            const result = await this.messageService.deleteMessage(dto.messageId);
            res.status(HttpStatusCode.OK).json({ success: true, message: SuccessMessages.MESSAGE_DELETED, data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async deleteConversation(req: Request, res: Response): Promise<void> {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this.messageService.deleteConversation(dto.conversationId);
            res.status(HttpStatusCode.OK).json({ success: true, message: SuccessMessages.CONVERSATION_DELETED, data: result });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
}