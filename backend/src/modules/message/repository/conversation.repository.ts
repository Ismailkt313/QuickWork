import { IConversation, IConversationResponse, IConversationRepository } from "../interface/message.interface";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { logger } from "../../../utils/logger";

export class ConversationRepository implements IConversationRepository {
    async createConversation(conversation: IConversation): Promise<IConversationResponse> {
        const newConversation = new Conversation(conversation);
        const savedConversation = await newConversation.save();
        return savedConversation.toObject() as unknown as IConversationResponse;
    }

    async getConversations(userId: string): Promise<IConversationResponse[]> {
        try {
            const conversations = await Conversation.find({ participants: userId })
                .populate("participants", "name email _id")
                .sort({ updatedAt: -1 });

            return conversations.map((c: { toObject: () => unknown }) => c.toObject() as unknown as IConversationResponse);
        } catch (error: unknown) {
            logger.error({ error, userId }, "Error fetching conversations in repository");
            throw error;
        }
    }

    async getConversation(conversationId: string): Promise<IConversationResponse | null> {
        const conversation = await Conversation.findById(conversationId);
        return conversation ? (conversation.toObject() as unknown as IConversationResponse) : null;
    }

    async deleteConversation(conversationId: string): Promise<IConversationResponse | null> {
        await Message.deleteMany({ conversationId: conversationId });
        const deletedConversation = await Conversation.findByIdAndDelete(conversationId);
        return deletedConversation ? (deletedConversation.toObject() as unknown as IConversationResponse) : null;
    }

    async findConversationByParticipants(participants: string[]): Promise<IConversationResponse | null> {
        const conversation = await Conversation.findOne({
            participants: { $all: participants, $size: participants.length }
        });
        return conversation ? (conversation.toObject() as unknown as IConversationResponse) : null;
    }

    async updateConversationMetadata(
        conversationId: string,
        metadata: { lastMessage: string, lastMessageAt: Date }
    ): Promise<IConversationResponse | null> {
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            {
                lastMessage: metadata.lastMessage,
                lastMessageAt: metadata.lastMessageAt
            },
            { new: true }
        );
        return updatedConversation ? (updatedConversation.toObject() as unknown as IConversationResponse) : null;
    }
}