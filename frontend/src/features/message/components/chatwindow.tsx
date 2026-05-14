import { useEffect, useRef } from "react";
import type { Message } from "../types/message.types";
import { RiUser3Line, RiDeleteBinLine, RiArrowLeftLine, RiMessage2Line } from "react-icons/ri";
import { format } from "date-fns";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  sendMessage: (receiverId: string, text: string, imageUrl?: string) => void;
  receiverId: string | null;
  currentUserId: string;
  recipientName?: string;
  onDelete: () => void;
  isDeleting?: boolean;
  onDeleteMessage: (messageId: string) => void;
  onBack?: () => void;
}

export const ChatWindow = ({
  messages,
  loading,
  sendMessage,
  receiverId,
  currentUserId,
  recipientName,
  onDelete,
  isDeleting,
  onDeleteMessage,
  onBack,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!receiverId) {
    return (
      <div className="chat-empty-state d-flex align-items-center justify-content-center bg-white rounded-4 h-100 shadow-sm border overflow-hidden">
        <div className="text-center p-5 animate-fade-in">
          <div
            className="empty-icon-wrap mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{
              width: 120,
              height: 120,
              background: "#eff6ff",
              borderRadius: "40px",
              color: "#3b82f6",
              transform: "rotate(-5deg)",
            }}
          >
            <RiMessage2Line size={60} />
          </div>
          <h4 className="fw-bold text-dark mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Your Conversations</h4>
          <p className="text-secondary mx-auto" style={{ maxWidth: "280px" }}>
            Select a chat from the list to view messages and start collaborating.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface d-flex flex-column h-100 bg-white position-relative overflow-hidden">
      {/* --- Production Header --- */}
      <div className="chat-header px-3 py-2 border-bottom bg-white d-flex align-items-center justify-content-between shadow-sm"
        style={{ 
          minHeight: "64px",
          paddingTop: "env(safe-area-inset-top, 0px)",
          boxSizing: "content-box",
          zIndex: 100,
          position: "sticky",
          top: 0
        }}>
        <div className="d-flex align-items-center gap-2">
          {onBack && (
            <button
              className="btn btn-link text-dark p-2 me-1"
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', borderRadius: '12px' }}
            >
              <RiArrowLeftLine size={24} />
            </button>
          )}
          <div className="position-relative">
            <div
              className="avatar-header d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{
                width: "42px",
                height: "42px",
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "white",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontFamily: "Syne, sans-serif",
              }}
            >
              {recipientName ? recipientName[0].toUpperCase() : "?"}
            </div>
            <div
              className="status-dot position-absolute bottom-0 end-0 border border-2 border-white bg-success rounded-circle"
              style={{ width: "12px", height: "12px" }}
            ></div>
          </div>
          <div className="min-width-0">
            <h6 className="mb-0 fw-bold text-dark text-truncate" style={{ fontSize: "0.95rem" }}>
              {recipientName || "Chat"}
            </h6>
            <span className="text-success fw-medium" style={{ fontSize: "0.7rem" }}>Online</span>
          </div>
        </div>

        <div className="d-flex align-items-center">
          <button
            className="btn btn-icon-modern text-muted"
            onClick={onDelete}
            disabled={isDeleting}
            style={{ width: '40px', height: '40px' }}
          >
            <RiDeleteBinLine size={20} />
          </button>
        </div>
      </div>

      {/* --- Production Scroll Container --- */}
      <div
        className="flex-grow-1 overflow-y-auto custom-scrollbar bg-slate-50"
        style={{
          scrollBehavior: 'smooth',
          background: "#f8fafc",
          padding: "20px 16px"
        }}
      >
        {loading ? (
          <div className="h-100 d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary opacity-50" role="status"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center opacity-40">
            <RiUser3Line size={64} className="mb-3" />
            <p className="small fw-bold">Start the conversation</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-1">
            {messages.map((msg, idx) => {
              const isSentByMe = msg.sender === currentUserId;
              const prevMsg = messages[idx - 1];
              const nextMsg = messages[idx + 1];
              const isSameSenderAsPrev = prevMsg && prevMsg.sender === msg.sender;
              const isSameSenderAsNext = nextMsg && nextMsg.sender === msg.sender;

              return (
                <div
                  key={msg._id}
                  className={`d-flex flex-column ${isSentByMe ? "align-items-end" : "align-items-start"} ${isSameSenderAsNext ? 'mb-0' : 'mb-2'} animate-message`}
                >
                  <div className={`message-bubble-row d-flex align-items-center gap-2 ${isSentByMe ? "flex-row-reverse" : "flex-row"}`} style={{ maxWidth: '88%' }}>
                    <div
                      className={`message-bubble p-3 shadow-xs ${isSentByMe
                          ? "bg-primary text-white"
                          : "bg-white text-dark border-light"
                        }`}
                      style={{
                        borderRadius: isSentByMe
                          ? (isSameSenderAsPrev ? "20px 4px 4px 20px" : "20px 20px 4px 20px")
                          : (isSameSenderAsPrev ? "4px 20px 20px 4px" : "20px 20px 20px 4px"),
                        lineHeight: "1.4",
                        fontSize: "0.92rem",
                        position: "relative",
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.image && (
                        <div className="mb-2 overflow-hidden rounded-3 border">
                          <img
                            src={msg.image}
                            alt="Attachment"
                            className="img-fluid"
                            style={{
                              maxHeight: "300px",
                              width: "100%",
                              objectFit: "cover"
                            }}
                          />
                        </div>
                      )}
                      {msg.message && <div className="message-text">{msg.message}</div>}

                      {!isSameSenderAsNext && (
                        <div
                          className={`message-time mt-1 opacity-60 ${isSentByMe ? "text-end" : "text-start"}`}
                          style={{ fontSize: "0.6rem", fontWeight: 700 }}
                        >
                          {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : "Just now"}
                        </div>
                      )}
                    </div>

                    {isSentByMe && (
                      <button
                        onClick={() => onDeleteMessage(msg._id)}
                        className="btn btn-sm text-danger p-1 delete-msg-btn transition-all"
                        title="Delete Message"
                      >
                        <RiDeleteBinLine size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* --- Production Input Fixed at Bottom --- */}
      <div className="chat-footer p-3 bg-white border-top shadow-lg"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 12px))" }}>
        <MessageInput
          onSend={(text, imageUrl) => sendMessage(receiverId, text, imageUrl)}
          disabled={loading}
        />
      </div>

      <style>{`
        .animate-message { animation: messageIn 0.2s ease-out; }
        @keyframes messageIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        
        .delete-msg-btn { 
          opacity: 0.3; 
          transition: opacity 0.2s;
        }
        .message-bubble-row:hover .delete-msg-btn { opacity: 0.7; }
        .delete-msg-btn:hover { opacity: 1 !important; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        
        .shadow-xs { box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05); }
        .border-light { border: 1px solid #f1f5f9 !important; }
        
        .btn-icon-modern {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: all 0.2s;
          border: none;
          background: transparent;
        }
        .btn-icon-modern:hover { background: #f1f5f9; color: var(--qw-accent) !important; }
      `}</style>
    </div>
  );
};
