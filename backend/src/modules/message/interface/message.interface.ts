import { Request, Response } from "express";
import { ConversationResponseDTO, MessageResponseDTO } from "../dto/message.response.dto";
export interface IMessage {
    conversationId: string;
    sender: string;
    receiver: string;
    message: string;
    messageType: string;
    isRead: boolean;
}

export interface IConversation {
    participants: string[];
    lastMessage: string;
    lastMessageAt: Date;
}


export interface IMessageResponse {
    _id: string;
    conversationId: string;
    sender: string;
    receiver: string;
    message: string;
    messageType: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversationResponse {
    _id: string;
    participants: string[];
    lastMessage: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessageService {
    createMessage(message: IMessage): Promise<MessageResponseDTO>;
    getMessages(conversationId: string): Promise<MessageResponseDTO[]>;
    getConversations(userId: string): Promise<ConversationResponseDTO[]>;
    getConversation(conversationId: string): Promise<ConversationResponseDTO>;
    deleteMessage(messageId: string): Promise<MessageResponseDTO>;
    deleteConversation(conversationId: string): Promise<ConversationResponseDTO>;
}

export interface IMessageController {
    createMessage(req: Request, res: Response): Promise<void>;
    getMessages(req: Request, res: Response): Promise<void>;
    getConversations(req: Request, res: Response): Promise<void>;
    getConversation(req: Request, res: Response): Promise<void>;
    deleteMessage(req: Request, res: Response): Promise<void>;
    deleteConversation(req: Request, res: Response): Promise<void>;
}   

export interface IMessageRepository {
    createMessage(message: IMessage): Promise<IMessageResponse>;
    getMessages(conversationId: string): Promise<IMessageResponse[]>;
    deleteMessage(messageId: string): Promise<IMessageResponse | null>;
}

export interface IConversationRepository {
    createConversation(conversation: IConversation): Promise<IConversationResponse>;
    getConversations(userId: string): Promise<IConversationResponse[]>;
    getConversation(conversationId: string): Promise<IConversationResponse | null>;
    deleteConversation(conversationId: string): Promise<IConversationResponse | null>;
    findConversationByParticipants(participants: string[]): Promise<IConversationResponse | null>;
    updateConversationMetadata(conversationId: string, metadata: { lastMessage: string, lastMessageAt: Date }): Promise<IConversationResponse | null>;
}