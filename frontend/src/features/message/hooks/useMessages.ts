import { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import type { Message } from "../types/message.types";
import { MESSAGE_TYPE } from "../../../constants/message";
import { getMessages as fetchMessagesApi, createMessage } from "../api/message.api";
import { toast } from "react-toastify";

export const useMessages = (
  socket: Socket | null,
  activeConversationId: string | null,
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

      const handleNewMessage = (newMessage: Message & { text?: string; id?: string; conversationId?: string }) => {
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
          _id: String(newMessage.id || newMessage._id || Date.now()),
          sender: String(newMessage.sender),
          receiver: String(newMessage.receiver),
          message: newMessage.text || newMessage.message || "",
          image: newMessage.image,
          messageType: (newMessage.messageType || (newMessage.image ? "image" : "text")) as MESSAGE_TYPE,
          createdAt: newMessage.createdAt || new Date().toISOString(),
        };

        setMessages((prev) => {
          if (prev.some((m) => m._id === normalizedMessage._id)) return prev;
          return [...prev, normalizedMessage];
        });
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
      if (!conversationId.startsWith("new-")) {
        setLoading(true);
        setMessages([]);
        try {
          const response = await fetchMessagesApi(conversationId);
          if (response.success) {
            const mappedMessages = response.data.map((m: Message & { text?: string; id?: string }) => ({
              ...m,
              _id: m.id || m._id,
              message: m.text || m.message,
              image: m.image
            }));
            setMessages(mappedMessages);
          }
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    } else {
      setMessages([]);
    }
  }, []);

  const sendMessage = useCallback(
    async (receiverId: string | null, message: string, imageUrl?: string) => {
      if (receiverId && (message.trim() || imageUrl)) {
        try {
          const dataToAPI: {
            receiverId: string;
            text?: string;
            image?: string;
            conversationId?: string;
          } = { receiverId };
          if (message.trim()) dataToAPI.text = message;
          if (imageUrl) dataToAPI.image = imageUrl;

          if (activeConversationId && !activeConversationId.startsWith("new-")) {
            dataToAPI.conversationId = activeConversationId;
          }
          await createMessage(dataToAPI);
        } catch (error) {
          console.error("Failed to send message:", error);
          toast.error("Failed to send message");
        }
      }
    },
    [activeConversationId],
  );

  return { messages, setMessages, sendMessage, loadMessages, loading };
};
