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
    participants: { _id: string; name: string; email: string }[];
    lastMessage: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const mapConversationToResponseDTO = (conversation: IConversationResponse): ConversationResponseDTO => {
    if (!conversation) {
        return { id: "", participants: [], lastMessage: "", lastMessageAt: new Date(), createdAt: new Date(), updatedAt: new Date() };
    }

    const participants = Array.isArray(conversation.participants) ? conversation.participants.map((p: unknown) => {
        if (typeof p === 'string') {
            return { _id: p, name: "User", email: "" };
        }
        const pObj = p as { _id?: unknown; name?: string; email?: string } | null;
        return {
            _id: pObj?._id ? pObj._id.toString() : (pObj?.toString() || ""),
            name: pObj?.name || "User",
            email: pObj?.email || ""
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
};


