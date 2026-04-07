import { useEffect, useState, useCallback } from "react";
import type { Message } from "../types/message.types";
import { getMessages as fetchMessagesApi } from "../api/message.api";

export const useMessages = (socket: any, activeConversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      // Check if message belongs to active conversation or matches a placeholder
      const matchesPlaceholder = activeConversationId?.startsWith("new-") && 
        (String(activeConversationId) === `new-${newMessage.sender}` || String(activeConversationId) === `new-${newMessage.receiver}`);
        
      if (newMessage.conversationId !== activeConversationId && !matchesPlaceholder) return;

      // Map API response field 'id' to '_id' if needed for consistency with Message type
      const normalizedMessage: Message = {
        _id: newMessage.id || newMessage._id,
        sender: newMessage.sender,
        receiver: newMessage.receiver,
        message: newMessage.message,
        messageType: newMessage.messageType || "text", 
        createdAt: newMessage.createdAt,
      };
      setMessages(prev => [...prev, normalizedMessage]);
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [socket, activeConversationId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await fetchMessagesApi(conversationId);
      if (response.success) {
        // Map backend 'id' to '_id' for frontend consistency
        const mappedMessages = response.data.map((m: any) => ({
          ...m,
          _id: m.id || m._id
        }));
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup: clear messages when activeConversationId changes
  useEffect(() => {
    setMessages([]);
  }, [activeConversationId]);

  const sendMessage = useCallback((receiverId: string | null, message: string) => {
    if (socket && receiverId && message.trim()) {
      socket.emit("sendMessage", { receiverId, message });
    }
  }, [socket]);

  return { messages, setMessages, sendMessage, loadMessages, loading };
};