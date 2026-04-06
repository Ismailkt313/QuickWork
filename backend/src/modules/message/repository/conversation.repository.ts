import { IConversation, IConversationResponse, IConversationRepository } from "../interface/message.interface";
import { Conversation } from "../modals/conversation.modal";

export class ConversationRepository implements IConversationRepository {
    async createConversation(conversation: IConversation): Promise<IConversationResponse> {
        const newConversation = new Conversation(conversation);
        const savedConversation = await newConversation.save();
        return savedConversation.toObject() as unknown as IConversationResponse;
    }

    async getConversations(userId: string): Promise<IConversationResponse[]> {
        try {
            console.log("DEBUG: Repo.getConversations searching for userId:", userId);
            const conversations = await Conversation.find({ participants: userId })
                .populate("participants", "name email _id")
                .sort({ updatedAt: -1 });
            
            console.log("DEBUG: Repo.getConversations found count:", conversations.length);
            return conversations.map(c => c.toObject() as unknown as IConversationResponse);
        } catch (error: any) {
            console.error("ERROR AT Repo.getConversations:", error);
            throw error;
        }
    }

    async getConversation(conversationId: string): Promise<IConversationResponse | null> {
        const conversation = await Conversation.findById(conversationId);
        return conversation ? (conversation.toObject() as unknown as IConversationResponse) : null;
    }

    async deleteConversation(conversationId: string): Promise<IConversationResponse | null> {
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