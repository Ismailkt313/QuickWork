import { useEffect, useRef } from "react";
import type { Message } from "../types/message.types";
import { RiUser3Line } from "react-icons/ri";
import { format } from "date-fns";
import { MessageInput } from "./MessageInput";

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  sendMessage: (receiverId: string, text: string) => void;
  receiverId: string | null;
  currentUserId: string;
  recipientName?: string;
}

export const ChatWindow = ({ 
  messages, 
  loading,
  sendMessage, 
  receiverId, 
  currentUserId, 
  recipientName 
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
      <div className="chat-interface d-flex align-items-center justify-content-center bg-light rounded-4 h-100 shadow-sm border">
        <div className="text-center p-5">
          <div className="avatar-circle mx-auto mb-3" style={{ width: 80, height: 80, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            <RiUser3Line size={40} className="text-secondary" />
          </div>
          <h4 className="fw-bold text-dark">Select a conversation</h4>
          <p className="text-secondary">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface d-flex flex-column h-100 bg-white rounded-4 shadow-sm border overflow-hidden">
      {/* Chat Header */}
      <div className="chat-header p-3 border-bottom bg-white d-flex align-items-center gap-3">
        <div className="avatar-circle" style={{ width: 40, height: 40, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
          <RiUser3Line size={20} className="text-primary" />
        </div>
        <div>
          <h6 className="mb-0 fw-bold text-dark">{recipientName || 'Chat'}</h6>
          <span className="text-success small d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
            <span className="bg-success rounded-circle" style={{ width: 6, height: 6 }}></span>
            Active Now
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow-1 overflow-auto p-4 bg-light bg-opacity-50" style={{ backgroundImage: 'linear-gradient(#f8fafc 1px, transparent 1px), linear-gradient(90deg, #f8fafc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        {loading ? (
          <div className="h-100 d-flex align-items-center justify-content-center">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center text-secondary opacity-50">
            <RiUser3Line size={48} className="mb-2" />
            <p className="small fw-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {messages.map((msg) => {
              const isSentByMe = msg.sender === currentUserId;
              return (
                <div 
                  key={msg._id} 
                  className={`d-flex flex-column ${isSentByMe ? "align-items-end" : "align-items-start"}`}
                >
                  <div 
                    className={`p-3 rounded-4 small shadow-sm ${
                      isSentByMe 
                        ? "bg-primary text-white" 
                        : "bg-white text-dark border"
                    }`}
                    style={{ maxWidth: '75%', lineHeight: '1.4' }}
                  >
                    {msg.message}
                  </div>
                  <div className="px-2 mt-1 opacity-50" style={{ fontSize: '0.65rem' }}>
                    {msg.createdAt ? format(new Date(msg.createdAt), "h:mm a") : ''}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

       <div className="p-3 bg-white border-top">
        <MessageInput 
          onSend={(text) => sendMessage(receiverId, text)} 
          disabled={loading}
        />
      </div>
    </div>
  );
};