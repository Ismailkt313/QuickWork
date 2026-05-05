import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";

export const getConversations = async () => {
  const response = await api.get(ENDPOINTS.MESSAGES.GET_CONVERSATIONS);
  return response.data;
};

export const getMessages = async (conversationId: string) => {
  const response = await api.get(ENDPOINTS.MESSAGES.GET_MESSAGES, {
    params: { conversationId },
  });
  return response.data;
};

export const getConversation = async (conversationId: string) => {
  const response = await api.get(ENDPOINTS.MESSAGES.GET_CONVERSATION, {
    params: { conversationId },
  });
  return response.data;
};

export const createMessage = async (data: {
  receiverId: string;
  text?: string;
  image?: string;
  conversationId?: string;
}) => {
  const response = await api.post(ENDPOINTS.MESSAGES.CREATE, data);
  return response.data;
};

export const deleteConversation = async (conversationId: string) => {
  const response = await api.delete(ENDPOINTS.MESSAGES.DELETE_CONVERSATION, {
    params: { conversationId },
  });
  return response.data;
};

export const deleteMessage = async (messageId: string) => {
    const response = await api.delete(ENDPOINTS.MESSAGES.DELETE_MESSAGE, {
        params: { messageId },
    });
    return response.data;
}