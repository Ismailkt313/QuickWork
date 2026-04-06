import React from 'react';
import { RiMessage2Line, RiSearchLine } from "react-icons/ri";
import { ConversationItem } from './ConversationItem';

interface SidebarProps {
  conversations: any[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  getRecipientDetails: (conv: any) => { name: string; id: string | null };
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelect,
  loading,
  searchQuery,
  onSearchChange,
  getRecipientDetails
}) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 d-flex flex-column" style={{ background: '#fff' }}>
      <div className="p-4 bg-white border-bottom">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <RiMessage2Line className="text-primary" />
          Messages
        </h5>
        <div className="input-group bg-light rounded-3 px-3 py-1">
          <span className="input-group-text bg-transparent border-0 p-0 me-2 text-secondary">
            <RiSearchLine />
          </span>
          <input
            type="text"
            className="form-control bg-transparent border-0 shadow-none small"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto p-2">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-5 text-secondary small">
            <RiMessage2Line size={32} className="opacity-25 mb-2" />
            <p>{searchQuery ? 'No matching conversations' : 'No conversations found'}</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={activeConversationId === conv.id}
              onClick={onSelect}
              otherParticipant={getRecipientDetails(conv)}
            />
          ))
        )}
      </div>
    </div>
  );
};
