import React from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay d-flex align-items-center justify-content-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-card bg-white rounded-4 shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200"
        style={{
          maxWidth: '400px',
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                type === 'danger' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'
              }`}
              style={{ width: '48px', height: '48px' }}
            >
              <RiErrorWarningLine size={24} />
            </div>
            <h5 className="mb-0 fw-bold text-dark">{title}</h5>
          </div>
          <p className="text-secondary mb-0" style={{ fontSize: '0.9375rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>
        
        <div className="p-3 bg-light d-flex gap-2 justify-content-end">
          <button 
            className="btn btn-link text-secondary text-decoration-none fw-medium px-4"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            className={`btn px-4 rounded-3 fw-bold ${
              type === 'danger' ? 'btn-danger shadow-danger' : 'btn-primary shadow-primary'
            }`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
