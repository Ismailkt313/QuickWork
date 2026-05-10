import React from "react";
import { Link } from "react-router-dom";
import { RiMessage2Line, RiSearchLine, RiMapPin2Line, RiMenuLine, RiUser3Line } from "react-icons/ri";
import { ConversationItem } from "./ConversationItem";

import type { Conversation } from "../types";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  getRecipientDetails: (conv: Conversation) => { name: string; id: string | null };
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelect,
  loading,
  searchQuery,
  onSearchChange,
  getRecipientDetails,
  isMobile = false,
}) => {
  const handleToggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("qw-toggle-sidebar"));
  };

  return (
    <div
      className={`sidebar-container h-100 d-flex flex-column bg-white ${isMobile ? "mobile-sidebar" : ""}`}
      style={{ 
        borderRight: isMobile ? "none" : "1px solid #f1f5f9",
      }}
    >
      {/* Mobile Sticky Header - Restored and Improved */}
      {isMobile && (
        <div className="mobile-chat-header">
          <div className="d-flex align-items-center justify-content-between w-100 h-100">
            <div className="header-left">
              <button 
                className="mobile-header-action" 
                onClick={handleToggleSidebar} 
                aria-label="Open sidebar"
              >
                <RiMenuLine size={24} />
              </button>
            </div>
            
            <div className="header-center">
              <div className="d-flex align-items-center gap-2">
                <RiMapPin2Line className="text-primary" size={20} />
                <span className="mobile-header-title">QuickWork</span>
              </div>
            </div>

            <div className="header-right">
              <Link to="/user/profile" className="mobile-header-profile">
                <RiUser3Line size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className={`sidebar-header ${isMobile ? "p-3 pt-4" : "p-4 pb-3"}`}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-black m-0 text-dark" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px', fontSize: isMobile ? '1.5rem' : '1.75rem' }}>
              Messages
            </h4>
            {!loading && conversations.length > 0 && (
              <span className="unread-count-badge">
                {conversations.length}
              </span>
            )}
          </div>
        </div>
        
        <div className="search-production-wrap position-relative">
          <RiSearchLine className="search-icon" />
          <input
            type="text"
            className="search-input-production"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="conversation-scroll flex-grow-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border spinner-border-sm text-primary mb-2 opacity-30" role="status"></div>
            <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Syncing...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-5 px-4 animate-fade-in">
            <div className="empty-chat-icon mb-3 mx-auto">
              <RiMessage2Line size={40} />
            </div>
            <h6 className="fw-bold text-dark mb-1">No chats found</h6>
            <p className="text-muted small px-3">
              {searchQuery ? "No results for your search" : "Your inbox is empty."}
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversationId === conv.id}
                onClick={onSelect}
                otherParticipant={getRecipientDetails(conv)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .unread-count-badge {
          background: #3b82f6;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 100px;
          box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
        }

        .mobile-chat-header {
          padding: 0 16px;
          background: #ffffff;
          border-bottom: 1px solid rgba(15, 23, 42, 0.05);
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          height: 60px;
          padding-top: env(safe-area-inset-top, 0px);
          box-sizing: content-box;
        }

        .mobile-header-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 18px;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .mobile-header-action {
          border: none;
          background: transparent;
          color: #0f172a;
          padding: 8px;
          margin-left: -8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .mobile-header-action:active {
          transform: scale(0.9);
          opacity: 0.6;
        }

        .mobile-header-profile {
          width: 36px;
          height: 36px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }

        .mobile-header-profile:active {
          transform: scale(0.9);
          background: #f1f5f9;
        }
        
        .search-production-wrap {
          background: #f1f5f9;
          border-radius: 12px;
          padding: 1px;
          transition: all 0.2s;
        }
        .search-production-wrap:focus-within {
          background: #fff;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0,0,0,0.03);
          border-color: #3b82f6;
        }
        
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 16px;
          pointer-events: none;
        }
        
        .search-input-production {
          width: 100%;
          border: none;
          background: transparent;
          padding: 8px 10px 8px 38px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #1e293b;
          outline: none;
        }
        
        .empty-chat-icon {
          width: 80px;
          height: 80px;
          background: #f8fafc;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

        @media (max-width: 991px) {
          .sidebar-header {
            background: #ffffff;
          }
          .conversation-scroll {
            background: #ffffff;
          }
        }
      `}</style>
    </div>
  );
};
