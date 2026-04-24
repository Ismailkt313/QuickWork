import { api } from "../../../services/api";

export const getConversations = async () => {
  const response = await api.get("/messages/getConversations");
  return response.data;
};

export const getMessages = async (conversationId: string) => {
  const response = await api.get("/messages/getMessages", {
    params: { conversationId },
  });
  return response.data;
};

export const getConversation = async (conversationId: string) => {
  const response = await api.get("/messages/getConversation", {
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
  const response = await api.post("/messages/createMessage", data);
  return response.data;
};

export const deleteConversation = async (conversationId: string) => {
  const response = await api.delete("/messages/deleteConversation", {
    params: { conversationId },
  });
  return response.data;
};

export const deleteMessage = async (messageId: string) => {
    const response = await api.delete("/messages/deleteMessage", {
        params: { messageId },
    });
    return response.data;
}