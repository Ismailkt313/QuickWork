import React from "react";
import { formatDistanceToNow } from "date-fns";

import type { Conversation } from "../types";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: (id: string) => void;
  otherParticipant: { name: string; id: string | null };
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
  otherParticipant,
}) => {
  const isUnread = conversation.unreadCount && conversation.unreadCount > 0 && !isActive;

  return (
    <div
      onClick={() => onClick(conversation.id)}
      className={`conversation-item d-flex align-items-center gap-3 p-3 mb-1 cursor-pointer transition-all ${
        isActive ? "active" : ""
      } ${isUnread ? "is-unread" : ""}`}
      style={{
        borderRadius: "16px",
        cursor: "pointer",
        position: "relative",
        border: "1px solid transparent",
      }}
    >
      <div className="avatar-wrapper position-relative flex-shrink-0">
        <div
          className="avatar-main d-flex align-items-center justify-content-center fw-bold shadow-sm"
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            fontSize: "1.2rem",
            fontFamily: "Syne, sans-serif",
            background: isActive ? "white" : "linear-gradient(135deg, #f8fafc, #f1f5f9)",
            color: isActive ? "#3b82f6" : "#475569",
            border: isActive ? "none" : "1px solid #e2e8f0"
          }}
        >
          {otherParticipant.name[0]?.toUpperCase()}
        </div>
        <div 
          className="status-indicator position-absolute bottom-0 end-0 border border-2 border-white bg-success rounded-circle shadow-sm"
          style={{ width: "14px", height: "14px", transform: "translate(2px, 2px)" }}
        ></div>
      </div>

      <div className="content-wrapper flex-grow-1 min-width-0">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h6
            className={`m-0 fw-bold text-truncate ${isActive ? "text-white" : "text-slate-900"}`}
            style={{ fontSize: "0.95rem", letterSpacing: "-0.3px" }}
          >
            {otherParticipant.name}
          </h6>
          {conversation.lastMessageAt && (
            <span
              className={`small opacity-70 ${isActive ? "text-white" : "text-slate-500"}`}
              style={{ fontSize: "0.72rem", fontWeight: 600, marginTop: "2px" }}
            >
              {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                addSuffix: false,
              }).replace('about ', '').replace('less than a minute', 'now')}
            </span>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <p
            className={`m-0 small text-truncate ${isActive ? "text-white opacity-80" : isUnread ? "text-slate-900 fw-bold" : "text-slate-500"}`}
            style={{ fontSize: "0.85rem", fontWeight: isUnread ? 700 : 500, maxWidth: "85%" }}
          >
            {conversation.lastMessage || "Start a new conversation"}
          </p>
          {isUnread && (
            <div className="unread-dot bg-primary rounded-circle shadow-sm"
                 style={{ width: "10px", height: "10px" }}>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .conversation-item {
          border: 1px solid transparent;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .conversation-item:hover {
          background: #f8fafc;
          border-color: #f1f5f9;
        }
        .conversation-item.active {
          background: #3b82f6;
          box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }
        .conversation-item:active {
          transform: scale(0.97);
        }
        .is-unread {
          background: rgba(59, 130, 246, 0.03);
        }
      `}</style>
    </div>
  );
};
