import { ConversationResponseDTO, mapConversationToResponseDTO, mapMessageToResponseDTO, MessageResponseDTO } from "../dto/message.response.dto";
import { IConversationRepository, IMessage, IMessageRepository, IMessageService } from "../interface/message.interface";

export class MessageService implements IMessageService {
    private messageRepository: IMessageRepository;
    private conversationRepository: IConversationRepository;

    constructor(
        messageRepository: IMessageRepository,
        conversationRepository: IConversationRepository
    ) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
    }

    async createMessage(messageData: IMessage): Promise<MessageResponseDTO> {
        const sender = messageData.sender.toString();
        const receiver = messageData.receiver.toString();

        if (!messageData.text?.trim() && !messageData.image) {
            throw new Error("Message text or image is required");
        }

        if (sender === receiver) {
            throw new Error("Cannot send message to yourself");
        }

        let conversationId = messageData.conversationId;

        const participants = [sender, receiver].sort();

        if (!conversationId) {
            let conversation = await this.conversationRepository.findConversationByParticipants(participants);

            if (!conversation) {
                conversation = await this.conversationRepository.createConversation({
                    participants,
                    lastMessage: "",
                    lastMessageAt: new Date()
                });
            }

            conversationId = conversation._id;
        }

        const message = await this.messageRepository.createMessage({
            ...messageData,
            conversationId
        });

        const lastMessageSnippet = message.text ? message.text : (message.image ? "Sent an image" : "");

        await this.conversationRepository.updateConversationMetadata(
            conversationId,
            {
                lastMessage: lastMessageSnippet,
                lastMessageAt: new Date()
            }
        );

        return mapMessageToResponseDTO(message);
    }

    async getMessages(conversationId: string): Promise<MessageResponseDTO[]> {
        const messages = await this.messageRepository.getMessages(conversationId);
        return messages.map(mapMessageToResponseDTO);
    }

    async getConversations(userId: string): Promise<ConversationResponseDTO[]> {
        const conversations = await this.conversationRepository.getConversations(userId);
        return conversations.map(mapConversationToResponseDTO);
    }

    async getConversation(conversationId: string): Promise<ConversationResponseDTO> {
        const conversation = await this.conversationRepository.getConversation(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }
        return mapConversationToResponseDTO(conversation);
    }

    async deleteMessage(messageId: string): Promise<MessageResponseDTO> {
        const message = await this.messageRepository.deleteMessage(messageId);
        if (!message) {
            throw new Error("Message not found");
        }
        return mapMessageToResponseDTO(message);
    }

    async deleteConversation(conversationId: string): Promise<ConversationResponseDTO> {
        const conversation = await this.conversationRepository.deleteConversation(conversationId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }
        return mapConversationToResponseDTO(conversation);
    }
}
