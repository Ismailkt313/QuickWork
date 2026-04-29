import React from "react";
import { formatDistanceToNow } from "date-fns";

import { Conversation } from "../types";

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
  return (
    <div
      onClick={() => onClick(conversation.id)}
      className={`p-3 rounded-3 mb-2 cursor-pointer transition-all ${
        isActive
          ? "bg-primary text-white shadow-sm"
          : "bg-white hover-light border"
      }`}
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex align-items-center gap-3">
        <div
          className={`avatar-circle flex-shrink-0 ${isActive ? "bg-white text-primary" : "bg-light text-secondary"}`}
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            fontWeight: "bold",
          }}
        >
          {otherParticipant.name[0]?.toUpperCase()}
        </div>
        <div className="flex-grow-1 min-width-0">
          <div className="d-flex justify-content-between align-items-start">
            <h6
              className={`mb-1 fw-bold text-truncate ${isActive ? "text-white" : "text-dark"}`}
              style={{ fontSize: "0.95rem" }}
            >
              {otherParticipant.name}
            </h6>
            {conversation.lastMessageAt && (
              <span
                className={`small opacity-75 ms-2 ${isActive ? "text-white" : "text-secondary"}`}
                style={{ fontSize: "0.7rem" }}
              >
                {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                  addSuffix: false,
                })}
              </span>
            )}
          </div>
          <p
            className={`mb-0 small text-truncate ${isActive ? "text-white text-opacity-75" : "text-secondary"}`}
          >
            {conversation.lastMessage || "No messages yet"}
          </p>
        </div>
      </div>
    </div>
  );
};
