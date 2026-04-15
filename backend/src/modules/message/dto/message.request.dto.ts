import { AppError } from "../../../utils/AppError";
import { MESSAGE_TYPE } from "../../../constants/message";
import { HttpStatusCode } from "../../../constants/httpStatusCode"

export class CreateMessageDto {
    public readonly receiverId: string;
    public readonly message: string;
    public readonly messageType: MESSAGE_TYPE;
    public readonly conversationId?: string;

    private constructor(data: any) {
        this.receiverId = data.receiverId;
        this.message = data.message;
        this.messageType = data.messageType || MESSAGE_TYPE.TEXT;
        this.conversationId = data.conversationId || "";
    }

    public static create(data: any): CreateMessageDto {
        const errors: string[] = [];

        if (!data.receiverId) {
            errors.push("Receiver ID is required");
        }

        if (!data.message || data.message.trim().length === 0) {
            errors.push("Message content is required");
        }

        if (errors.length > 0) {
            throw new AppError(errors.join(". "), HttpStatusCode.BAD_REQUEST);
        }

        return new CreateMessageDto(data);
    }
}

export class ConversationIdDto {
    public readonly conversationId: string;

    private constructor(conversationId: string) {
        this.conversationId = conversationId;
    }

    public static create(data: any): ConversationIdDto {
        if (!data.conversationId) {
            throw new AppError("Conversation ID is required", HttpStatusCode.BAD_REQUEST);
        }
        return new ConversationIdDto(data.conversationId);
    }
}

export class MessageIdDto {
    public readonly messageId: string;

    private constructor(messageId: string) {
        this.messageId = messageId;
    }

    public static create(data: any): MessageIdDto {
        if (!data.messageId) {
            throw new AppError("Message ID is required", HttpStatusCode.BAD_REQUEST);
        }
        return new MessageIdDto(data.messageId);
    }
}
