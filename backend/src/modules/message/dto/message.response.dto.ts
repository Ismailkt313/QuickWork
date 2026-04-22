import { IConversationResponse, IMessageResponse } from "../interface/message.interface";

export interface MessageResponseDTO {
    id: string;
    conversationId: string;
    sender: string;
    receiver: string;
    text?: string;
    image?: string;
    messageType: string;
    isRead: boolean;
    createdAt: Date;
}

export const mapMessageToResponseDTO = (message: IMessageResponse): MessageResponseDTO => {
    return {
        id: message._id.toString(),
        conversationId: message.conversationId?.toString() || "",
        sender: message.sender?.toString() || "",
        receiver: message.receiver?.toString() || "",
        text: message.text,
        image: message.image,
        messageType: message.messageType,
        isRead: message.isRead,
        createdAt: message.createdAt,
    };
};

export interface ConversationResponseDTO {
    id: string;
    participants: any[];
    lastMessage: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const mapConversationToResponseDTO = (conversation: IConversationResponse): ConversationResponseDTO => {
    try {
        if (!conversation) {
            console.error("DEBUG: mapConversationToResponseDTO received null/undefined conversation");
            return { id: "", participants: [], lastMessage: "", lastMessageAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
        }

        const participants = Array.isArray(conversation.participants) ? conversation.participants.map((p: any) => {
            if (typeof p === 'string') {
                return { _id: p, name: "User", email: "" };
            }
            return {
                _id: p?._id ? p._id.toString() : (p?.toString() || ""),
                name: p?.name || "User",
                email: p?.email || ""
            };
        }) : [];

        return {
            id: conversation._id ? conversation._id.toString() : "",
            participants: participants,
            lastMessage: conversation.lastMessage || "",
            lastMessageAt: conversation.lastMessageAt || new Date(),
            createdAt: conversation.createdAt || new Date(),
            updatedAt: conversation.updatedAt || new Date(),
        };
    } catch (error: any) {
        console.error("ERROR AT mapConversationToResponseDTO:", error);
        throw error;
    }
};
