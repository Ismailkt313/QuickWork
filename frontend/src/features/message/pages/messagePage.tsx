import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useMessages } from "../hooks/useMessages";
import { ChatWindow } from "../components/chatwindow";
import { getMe } from "../../auth/services/authApi";
import { getConversations,deleteConversation,deleteMessage } from "../api/message.api";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import ConfirmModal from "../../../shared/components/ui/ConfirmModal";
import type { IUser } from "../../../types/user.types";
import type { Conversation, Participant } from "../types";

const MessagesPage: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const [placeholderAdded, setPlaceholderAdded] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; loading: boolean }>({
    show: false,
    loading: false
  });
  const [deleteMsgModal, setDeleteMsgModal] = useState<{ show: boolean; loading: boolean; messageId: string }>({
    show: false,
    loading: false,
    messageId: ""
  });

  const targetUserId = searchParams.get("userId");
  const targetUserName = searchParams.get("name");

  const token = localStorage.getItem("token");
  const socket = useSocket(token!);
  const {
    messages,
    sendMessage,
    loadMessages,
    loading: loadingMessages,
  } = useMessages(socket, selectedConversationId);

  const selectedConvIdRef = useRef(selectedConversationId);
  const currentUserIdRef = useRef("");

  useEffect(() => {
    selectedConvIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const handleDeleteConversation = async () => {
    if (!selectedConversationId || selectedConversationId.startsWith("new-")) return;
    setDeleteModal({ show: true, loading: false });
  };

  const executeDeleteConversation = async () => {
    if (!selectedConversationId) return;
    setDeleteModal(prev => ({ ...prev, loading: true }));
    try {
      const res = await deleteConversation(selectedConversationId);
      if (res.success) {
        setConversations(prev => prev.filter(c => c.id !== selectedConversationId));
        setSelectedConversationId(null);
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteModal({ show: false, loading: false });
    }
  };


  const fetchUser = useCallback(async () => {
    try {
      const response = await getMe();
      if (response.success) {
        setUser(response.data.data || response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const response = await getConversations();
      if (response.success) {
        setConversations((prev) => {
           const serverConvs = response.data || [];

          const placeholders = prev.filter((c) => c.isPlaceholder);
          const merged = [...serverConvs];

          placeholders.forEach((ph: Conversation) => {
            const phTargetId = ph.participants.find(
              (p: Participant) =>
                String(p._id || p.id) !== String(currentUserIdRef.current),
            )?._id;

            const alreadyExists = serverConvs.some((sc: Conversation) =>
              sc.participants.some(
                (p: Participant) => String(p._id || p.id) === String(phTargetId),
              ),
            );

            if (!alreadyExists) {
              merged.unshift(ph);
            }
          });

          return merged;
        });
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchConversations();
  }, [fetchUser, fetchConversations]);
const handleDeleteMessage = (messageId: string) => {
  setDeleteMsgModal({ show: true, loading: false, messageId });
};

const executeDeleteMessage = async () => {
  if (!deleteMsgModal.messageId) return;
  setDeleteMsgModal(prev => ({ ...prev, loading: true }));
  try {
    await deleteMessage(deleteMsgModal.messageId);
    // UI updates via socket listener in useMessages hook
  } catch (error) {
    console.error("Failed to delete message:", error);
  } finally {
    setDeleteMsgModal({ show: false, loading: false, messageId: "" });
  }
};
  const currentUserId = user?.id || user?._id || "";

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (
      placeholderAdded ||
      !currentUserId ||
      loadingConversations ||
      !targetUserId
    )
      return;

    const stringTargetId = String(targetUserId).trim();
    const stringCurrentId = String(currentUserId).trim();

    const existingConv = conversations.find((conv: Conversation) =>
      conv.participants.some(
        (p: Participant) => String(p._id || p.id).trim() === stringTargetId,
      ),
    );

    if (existingConv) {
      setSelectedConversationId(existingConv.id);
      setPlaceholderAdded(true);
    } else if (targetUserName) {
      const placeholderId = `new-${stringTargetId}`;
      const placeholderConv = {
        id: placeholderId,
        participants: [
          { _id: stringCurrentId, name: user?.name || "Client" },
          { _id: stringTargetId, name: targetUserName },
        ],
        lastMessage: "Start a new conversation",
        lastMessageAt: new Date(),
        isPlaceholder: true,
      };
      setConversations((prev) => {
        if (prev.some((c) => c.id === placeholderId)) return prev;
        return [placeholderConv, ...prev];
      });
      setSelectedConversationId(placeholderId);
      setPlaceholderAdded(true);
    }
  }, [
    loadingConversations,
    targetUserId,
    targetUserName,
    currentUserId,
    placeholderAdded,
    conversations,
    user?.name,
  ]);

  useEffect(() => {
    if (!socket) return;

    // 1. Define the handler for new messages
    const handleNewConversationMessage = (newMessage: {
      sender: string;
      receiver: string;
      conversationId: string;
      message: string;
    }) => {
      const currentSelectedId = selectedConvIdRef.current;
      const myUserId = currentUserIdRef.current;

      if (currentSelectedId?.startsWith("new-")) {
        const placeholderTargetId = currentSelectedId.replace("new-", "");
        const involvesTarget =
          String(newMessage.sender) === String(placeholderTargetId) ||
          String(newMessage.receiver) === String(placeholderTargetId);

        if (involvesTarget && newMessage.conversationId) {
          setSelectedConversationId(newMessage.conversationId);
        }
      }

      setConversations((prev) => {
        const convExists = prev.some((c) => c.id === newMessage.conversationId);
        const updated = prev.map((conv: Conversation) => {
          const phTargetId = conv.participants.find(
            (p: Participant) => String(p._id || p.id) !== String(myUserId)
          )?._id;
          const involvesThisParticipant =
            String(newMessage.sender) === String(phTargetId) ||
            String(newMessage.receiver) === String(phTargetId);

          if (
            conv.id === newMessage.conversationId ||
            (conv.isPlaceholder && involvesThisParticipant)
          ) {
            return {
              ...conv,
              id: newMessage.conversationId,
              isPlaceholder: false,
              lastMessage: newMessage.message,
              lastMessageAt: new Date(),
            };
          }
          return conv;
        });

        if (!convExists && !prev.some(c => c.isPlaceholder && String(c.id).includes(String(newMessage.sender)))) {
          fetchConversations();
        }
        return updated;
      });
    };

    // 2. Define the handler for deleted conversations
    const handleConversationDeleted = ({ conversationId }: { conversationId: string }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConvIdRef.current === conversationId) {
        setSelectedConversationId(null);
      }
    };

    // 3. Attach both listeners
    socket.on("receiveMessage", handleNewConversationMessage);
    socket.on("conversationDeleted", handleConversationDeleted);

    // 4. Clean up both listeners when the component unmounts
    return () => {
      socket.off("receiveMessage", handleNewConversationMessage);
      socket.off("conversationDeleted", handleConversationDeleted);
    };
  }, [socket, fetchConversations]);


  useEffect(() => {
    if (selectedConversationId && !selectedConversationId.startsWith("new-")) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId, loadMessages]);

  const activeConversation = conversations.find(
    (c) => String(c.id) === String(selectedConversationId),
  );

  const getRecipientDetails = (conversation: Conversation | null | undefined) => {
    if (!currentUserId || !conversation || !conversation.participants) {
      return { name: "System", id: null };
    }

    const normalizedCurrentId = String(currentUserId).trim();

    const recipient = conversation.participants.find(
      (p: Participant) => String(p._id || p.id).trim() !== normalizedCurrentId,
    );

    const actualRecipient = recipient || conversation.participants[0];

    return {
      name: actualRecipient?.name || "User",
      id: actualRecipient?._id || actualRecipient?.id || null,
    };
  };

  const recipient = getRecipientDetails(activeConversation);

  const filteredConversations = conversations.filter((c) => {
    if (!c.participants) return false;
    const recipientInfo = getRecipientDetails(c);
    return recipientInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "500px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid py-4 h-100"
      style={{ minHeight: "calc(100vh - 100px)" }}
    >
      <div className="mb-4 text-center">
        <h1 className="h3 fw-bold text-dark mb-1">Messages</h1>
        <p className="text-secondary small">Chat with your service providers</p>
      </div>

      <div className="row g-4" style={{ height: "calc(100vh - 220px)" }}>
        <div className="col-12 col-md-4 col-lg-3 h-100">
          <Sidebar
            conversations={filteredConversations}
            activeConversationId={selectedConversationId}
            onSelect={setSelectedConversationId}
            loading={loadingConversations}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            getRecipientDetails={getRecipientDetails}
          />
        </div>

        <div className="col-12 col-md-8 col-lg-9 h-100">
          <ChatWindow
            messages={messages}
            loading={loadingMessages}
            sendMessage={sendMessage}
            receiverId={recipient.id}
            currentUserId={currentUserId}
            recipientName={recipient.name}
            onDelete={handleDeleteConversation}
            onDeleteMessage={handleDeleteMessage}
            
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, loading: false })}
        onConfirm={executeDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this entire chat? All messages will be permanently removed for both participants."
        confirmText="Yes, Delete Chat"
        isLoading={deleteModal.loading}
      />

      <ConfirmModal
        isOpen={deleteMsgModal.show}
        onClose={() => setDeleteMsgModal({ show: false, loading: false, messageId: "" })}
        onConfirm={executeDeleteMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
        confirmText="Yes, Delete"
        isLoading={deleteMsgModal.loading}
      />
    </div>
  );
};

export default MessagesPage;
