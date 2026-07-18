import { Request, Response } from "express";
import { IMessageController, IMessageService } from "../interface/message.interface";
import { CreateMessageDto, ConversationIdDto, MessageIdDto } from "../dto/message.request.dto";
import { MESSAGE_TYPE } from "../../../constants/message";
import { HttpStatusCode } from "../../../constants/httpStatusCode"
import { ErrorMessages } from "../../../constants/messages/errorMessages";
import { SuccessMessages } from "../../../constants/messages/successMessages";

import { ITokenPayload } from '../../auth/interfaces/auth.interface';

import { appLogger } from "../../../shared/logger";

interface RequestWithCustomProps extends Request {
    user?: ITokenPayload & { _id?: string };
}

export class MessageController implements IMessageController {
    private _messageService: IMessageService;
    constructor(
        messageService: IMessageService
    ) {
        this._messageService = messageService
    }
    public createMessage = async (req: Request, res: Response): Promise<void> => {
        const customReq = req as RequestWithCustomProps;
        try {
            const senderId = customReq.user?.userId || customReq.user?._id;
            if (!senderId) {
                res.status(HttpStatusCode.UNAUTHORIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }
            appLogger.debug("Creating new message", { body: req.body });

            const dto = CreateMessageDto.create(req.body);

            const result = await this._messageService.createMessage({
                sender: senderId,
                receiver: dto.receiverId,
                text: dto.text,
                image: dto.image,
                messageType: dto.messageType || (dto.image ? MESSAGE_TYPE.IMAGE : MESSAGE_TYPE.TEXT),
                conversationId: dto.conversationId || "",
                isRead: false
            });

            const io = req.app.get("io");
            if (io) {
                const receiverRoom = String(dto.receiverId);
                const senderRoom = String(senderId);

                io.to(receiverRoom).emit("receiveMessage", result);
                io.to(senderRoom).emit("receiveMessage", result);
            }

            res.status(HttpStatusCode.CREATED).json({
                success: true,
                message: SuccessMessages.MESSAGE_CREATED,
                data: result
            });
        } catch (error: unknown) {
            const err = error as { statusCode?: number; message?: string };
            appLogger.error("Error in createMessage", { error: err.message });

            res.status(err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    };
    public getMessages = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this._messageService.getMessages(dto.conversationId);
            res.status(HttpStatusCode.OK).json({ success: true, data: result });
        } catch (error: unknown) {
            const err = error as { statusCode?: number; message?: string };
            res.status(err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    };

    public getConversations = async (req: Request, res: Response): Promise<void> => {
        const customReq = req as RequestWithCustomProps;
        try {
            const userId = customReq.user?.userId || customReq.user?._id;

            if (!userId) {
                appLogger.warn("No userId found in req.user");

                res.status(HttpStatusCode.UNAUTHORIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
                return;
            }
            const result = await this._messageService.getConversations(userId);
            res.status(HttpStatusCode.OK).json({ success: true, data: result });
        } catch (error: unknown) {
            const err = error as { statusCode?: number; message?: string };
            appLogger.error("Error in getConversations", { error: err.message });

            res.status(err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    };
    public getConversation = async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = ConversationIdDto.create(req.query);
            const result = await this._messageService.getConversation(dto.conversationId);
            res.status(HttpStatusCode.OK).json({ success: true, data: result });
        } catch (error: unknown) {
            const err = error as { statusCode?: number; message?: string };
            res.status(err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    };

    public deleteMessage = async (req: Request, res: Response): Promise<void> => {
        const customReq = req as RequestWithCustomProps;
        try {
            const dto = MessageIdDto.create(req.query);
            const result = await this._messageService.deleteMessage(dto.messageId);
            const io = req.app.get("io");
            if (io && result){
                const senderRoom = String(result.sender);
                const receiverRoom = String(result.receiver);

                appLogger.info("DEBUG: Emitting messageDeleted", { senderRoom, receiverRoom, messageId: dto.messageId });

                io.emit("messageDeleted", { messageId: dto.messageId });

                io.to(senderRoom).emit("messageDeleted", { messageId: dto.messageId });
                io.to(receiverRoom).emit("messageDeleted", { messageId: dto.messageId });
            }
            res.status(HttpStatusCode.OK).json({ success: true, message: SuccessMessages.MESSAGE_DELETED, data: result });
        } catch (error: unknown) {
            const err = error as { statusCode?: number; message?: string };
            res.status(err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    };

    public deleteConversation = async (req: Request, res: Response): Promise<void> => {
        const customReq = req as RequestWithCustomProps;
        try {
            const dto = ConversationIdDto.create(req.query);
            const conversation = await this._messageService.getConversation(dto.conversationId);
            const result = await this._messageService.deleteConversation(dto.conversationId);
            const io = req.app.get("io");
            if (io && conversation && conversation.participants) {

                io.emit("conversationDeleted", { conversationId: dto.conversationId });

                conversation.participants.forEach((p: { _id?: string; id?: string } | string) => {
                    const participantId = typeof p === 'string' ? p : String(p._id || p.id);
                    appLogger.info("DEBUG: Emitting conversationDeleted", { participantId, conversationId: dto.conversationId });
                    io.to(participantId).emit("conversationDeleted", {
                        conversationId: dto.conversationId
                    });
                });
            }

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: SuccessMessages.CONVERSATION_DELETED,
                data: result
            });
        } catch (error: unknown) {
            const err = error as { statusCode?: number; message?: string };
            res.status(err.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || ErrorMessages.INTERNAL_SERVER_ERROR });
        }
    };

}