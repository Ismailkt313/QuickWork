import React from "react";
import { createPortal } from "react-dom";
import {
  RiErrorWarningLine,
  RiCloseLine,
  RiRefreshLine,
  RiQuestionLine
} from "react-icons/ri";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage?: string;
}

const PaymentErrorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRetry,
  errorMessage = "We couldn't process your payment. Please check your card details or try a different payment method."
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="qw-error-overlay" onClick={onClose}>
      <div className="qw-error-modal animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <button className="qw-error-close" onClick={onClose}>
          <RiCloseLine size={20} />
        </button>

        <div className="qw-error-icon-box">
          <RiErrorWarningLine size={40} />
        </div>

        <h3>Payment Failed</h3>

        <div className="qw-error-message-box">
          <p>{errorMessage}</p>
        </div>

        <div className="qw-error-suggestions">
          <div className="suggestion-item">
            <RiQuestionLine size={16} />
            <span>Check your internet connection</span>
          </div>
          <div className="suggestion-item">
            <RiQuestionLine size={16} />
            <span>Ensure sufficient funds in account</span>
          </div>
        </div>

        <div className="qw-error-actions">
          <button className="qw-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="qw-btn-retry" onClick={onRetry}>
            <RiRefreshLine size={18} /> Try Again
          </button>
        </div>
      </div>

      <style>{`
        .qw-error-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000000;
        }

        .qw-error-modal {
          background: #fff;
          width: 100%;
          max-width: 400px;
          padding: 40px 32px;
          border-radius: 28px;
          text-align: center;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .qw-error-close {
          position: absolute;
          top: 20px;
          right: 20px;
          border: none;
          background: #f8fafc;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .qw-error-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .qw-error-icon-box {
          width: 80px;
          height: 80px;
          background: #fef2f2;
          color: #ef4444;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }

        .qw-error-modal h3 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 24px;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .qw-error-message-box {
          background: #f8fafc;
          padding: 16px;
          border-radius: 16px;
          margin-bottom: 24px;
        }

        .qw-error-message-box p {
          margin: 0;
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
        }

        .qw-error-suggestions {
          text-align: left;
          margin-bottom: 32px;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .suggestion-item span {
          font-weight: 500;
        }

        .qw-error-actions {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 12px;
        }

        .qw-btn-secondary {
          height: 48px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-btn-secondary:hover {
          background: #f8fafc;
        }

        .qw-btn-retry {
          height: 48px;
          border-radius: 14px;
          border: none;
          background: #0f172a;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .qw-btn-retry:hover {
          background: #1e293b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }

        .animate-pop-in {
          animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default PaymentErrorModal;
