import React from 'react';
import { FaBell, FaCheckDouble, FaTrash, FaCircle, FaTimes } from 'react-icons/fa';
import type { INotification } from '../services/notificationService';
import './NotificationModal.css';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: INotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-modal" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <div className="header-title">
            <FaBell className="bell-icon" />
            <h3>Notifications</h3>
            {unreadCount > 0 && <span className="unread-badge-text">{unreadCount} New</span>}
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={onMarkAllRead} title="Mark all as read">
                <FaCheckDouble />
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="notification-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>No notifications yet</p>
              <span>We'll notify you when something important happens.</span>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => {
                    if (!notification.isRead) onMarkRead(notification.id);
                    if (notification.link) {
                      window.location.href = notification.link;
                      onClose();
                    }
                  }}
                >
                  <div className="notification-icon-wrapper">
                    <div className={`type-icon ${notification.type.toLowerCase()}`}>
                      {notification.type === 'PAYMENT' ? '💰' :
                       notification.type === 'JOB_ASSIGNMENT' ? '📝' :
                       notification.type === 'JOB_STATUS' ? '⚙️' :
                       notification.type === 'REVIEW' ? '⭐' : '📢'}
                    </div>
                  </div>

                  <div className="notification-content">
                    <div className="notification-top">
                      <h4>{notification.title}</h4>
                      {!notification.isRead && <FaCircle className="unread-dot" />}
                    </div>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="notification-item-actions">
                     {!notification.isRead && (
                      <button
                        className="mark-read-item-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <FaCheckDouble />
                      </button>
                    )}
                    <button
                      className="delete-item-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="notification-footer">
          <button className="view-all-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
