import { IMessage, IMessageResponse, IMessageRepository } from "../interface/message.interface";
import { Message } from "../models/message.model";

export class MessageRepository implements IMessageRepository {
    async createMessage(message: IMessage): Promise<IMessageResponse> {
        const newMessage = new Message(message);
        const savedMessage = await newMessage.save();
        return savedMessage.toObject() as unknown as IMessageResponse;
    }

    async getMessages(conversationId: string): Promise<IMessageResponse[]> {
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        return messages.map((m: any) => m.toObject() as unknown as IMessageResponse);
    }

    async deleteMessage(messageId: string): Promise<IMessageResponse | null> {
        const deletedMessage = await Message.findByIdAndDelete(messageId);
        return deletedMessage ? (deletedMessage.toObject() as unknown as IMessageResponse) : null;
    }
}