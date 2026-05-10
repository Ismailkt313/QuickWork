import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { useMessages } from "../hooks/useMessages";
import { ChatWindow } from "../components/chatwindow";
import { getMe } from "../../auth/services/authApi";
import { getConversations, deleteConversation, deleteMessage } from "../api/message.api";
import { useSearchParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import ConfirmModal from "../../../shared/components/ui/ConfirmModal";
import { toast } from "react-toastify";
import type { IUser } from "../../../types/user.types";
import type { Conversation, Participant } from "../types";
import type { Message } from "../types/message.types";

const MessagesPage: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      toast.error("Failed to delete conversation");
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
      toast.error("Failed to load conversations");
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

    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Failed to delete message");
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
      const placeholderConv: Conversation = {
        id: placeholderId,
        unreadCount: 0,
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

    const handleNewConversationMessage = (newMessage: Message & { text?: string; id?: string; conversationId?: string }) => {
      const convId = newMessage.conversationId;
      if (!convId) return;

      const currentSelectedId = selectedConvIdRef.current;
      const myUserId = currentUserIdRef.current;

      const messageText = newMessage.text || newMessage.message || (newMessage.image ? "Sent an image" : "New message");

      if (currentSelectedId?.startsWith("new-")) {
        const placeholderTargetId = currentSelectedId.replace("new-", "");
        const involvesTarget =
          String(newMessage.sender) === String(placeholderTargetId) ||
          String(newMessage.receiver) === String(placeholderTargetId);

        if (involvesTarget) {
          setSelectedConversationId(convId);
        }
      }

      setConversations((prev) => {
        const convExists = prev.some((c) => c.id === convId);
        const updated = prev.map((conv: Conversation) => {
          const phTargetId = conv.participants.find(
            (p: Participant) => String(p._id || p.id) !== String(myUserId)
          )?._id;
          const involvesThisParticipant =
            String(newMessage.sender) === String(phTargetId) ||
            String(newMessage.receiver) === String(phTargetId);

          if (
            conv.id === convId ||
            (conv.isPlaceholder && involvesThisParticipant)
          ) {
            return {
              ...conv,
              id: convId as string,
              isPlaceholder: false,
              lastMessage: messageText,
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

    const handleConversationDeleted = ({ conversationId }: { conversationId: string }) => {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConvIdRef.current === conversationId) {
        setSelectedConversationId(null);
      }
    };

    socket.on("receiveMessage", handleNewConversationMessage);
    socket.on("conversationDeleted", handleConversationDeleted);

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

  const filteredConversations = conversations
    .filter((c) => {
      if (!c.participants) return false;
      const recipientInfo = getRecipientDetails(c);
      return recipientInfo.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA;
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
      className={`chat-page-wrapper ${isMobile ? "is-mobile" : ""}`}
      style={{
        height: isMobile ? "calc(100vh - 65px)" : "calc(100vh - 100px)",
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      {!isMobile && (
        <div className="chat-header-desktop p-4 text-center border-bottom bg-white">
          <h1 className="h4 fw-bold text-dark mb-1">Messages</h1>
          <p className="text-secondary small mb-0">Chat with your service providers</p>
        </div>
      )}

      <div className={`chat-layout-container ${isMobile ? "mobile-stack" : "desktop-grid"}`}>
        {(!isMobile || !selectedConversationId) && (
          <div className="chat-sidebar-area">
            <Sidebar
              conversations={filteredConversations}
              activeConversationId={selectedConversationId}
              onSelect={setSelectedConversationId}
              loading={loadingConversations}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              getRecipientDetails={getRecipientDetails}
              isMobile={isMobile}
            />
          </div>
        )}

        {(!isMobile || selectedConversationId) && (
          <div className={`chat-window-area ${isMobile && !selectedConversationId ? "d-none" : ""}`}>
            <ChatWindow
              messages={messages}
              loading={loadingMessages}
              sendMessage={sendMessage}
              receiverId={recipient.id}
              currentUserId={currentUserId}
              recipientName={recipient.name}
              onDelete={handleDeleteConversation}
              onDeleteMessage={handleDeleteMessage}
              onBack={isMobile ? () => setSelectedConversationId(null) : undefined}
            />
          </div>
        )}
      </div>

      {/* --- Design Tokens & Layout CSS --- */}
      <style>{`
        .chat-page-wrapper {
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }

        .chat-page-wrapper.is-mobile {
          height: 100%;
          height: 100dvh;
          position: relative;
          z-index: var(--z-index-content);
          width: 100%;
          background: #fff;
        }

        .chat-layout-container {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
          height: 100%;
        }

        .desktop-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 0;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          height: calc(100vh - 164px); /* Account for header + padding */
        }

        @media (min-width: 1200px) {
          .desktop-grid { grid-template-columns: 380px 1fr; }
        }

        .mobile-stack {
          width: 100%;
          height: 100%;
        }

        .chat-sidebar-area, .chat-window-area {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .is-mobile .chat-sidebar-area, 
        .is-mobile .chat-window-area {
          width: 100%;
          position: absolute;
          inset: 0;
          background: #fff;
        }

        .is-mobile .chat-sidebar-area {
          z-index: 1;
          padding-top: 0;
          padding-bottom: 74px; /* Space for bottom nav if not hidden */
        }

        /* When global header/footer are hidden (active chat) */
        .is-mobile .chat-window-area {
          z-index: 10;
          animation: slideInRight 0.25s cubic-bezier(0, 0, 0.2, 1);
        }

        @keyframes slideInRight {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .chat-sidebar-area {
          border-right: 1px solid #f1f5f9;
        }
      `}</style>

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
