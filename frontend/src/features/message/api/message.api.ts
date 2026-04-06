import { api } from "../../../services/api";

export const getConversations = async () => {
    const response = await api.get('/messages/getConversations');
    return response.data;
};

export const getMessages = async (conversationId: string) => {
    const response = await api.get('/messages/getMessages', {
        params: { conversationId }
    });
    return response.data;
};

export const getConversation = async (conversationId: string) => {
    const response = await api.get('/messages/getConversation', {
        params: { conversationId }
    });
    return response.data;
};