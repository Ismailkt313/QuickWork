import { useEffect, useState, useCallback } from "react";
import type { Message } from "../types/message.types";
import { getMessages as fetchMessagesApi, createMessage } from "../api/message.api";

export const useMessages = (
  socket: any,
  activeConversationId: string | null,
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      const matchesPlaceholder =
        activeConversationId?.startsWith("new-") &&
        (String(activeConversationId) === `new-${newMessage.sender}` ||
          String(activeConversationId) === `new-${newMessage.receiver}`);

      if (
        newMessage.conversationId !== activeConversationId &&
        !matchesPlaceholder
      )
        return;

      const normalizedMessage: Message = {
        _id: newMessage.id || newMessage._id,
        sender: newMessage.sender,
        receiver: newMessage.receiver,
        message: newMessage.text || newMessage.message,
        image: newMessage.image,
        messageType: newMessage.messageType || (newMessage.image ? "image" : "text"),
        createdAt: newMessage.createdAt,
      };
      setMessages((prev) => [...prev, normalizedMessage]);
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, activeConversationId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await fetchMessagesApi(conversationId);
      if (response.success) {
        const mappedMessages = response.data.map((m: any) => ({
          ...m,
          _id: m.id || m._id,
          message: m.text || m.message,
          image: m.image
        }));
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMessages([]);
  }, [activeConversationId]);

  const sendMessage = useCallback(
    async (receiverId: string | null, message: string, imageUrl?: string) => {
      if (receiverId && (message.trim() || imageUrl)) {
        try {
          const dataToAPI: any = { receiverId };
          if (message.trim()) dataToAPI.text = message;
          if (imageUrl) dataToAPI.image = imageUrl;

          if (activeConversationId && !activeConversationId.startsWith("new-")) {
            dataToAPI.conversationId = activeConversationId;
          }
          await createMessage(dataToAPI);
        } catch (error) {
          console.error("Failed to send message:", error);
        }
      }
    },
    [activeConversationId],
  );

  return { messages, setMessages, sendMessage, loadMessages, loading };
};
