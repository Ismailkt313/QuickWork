import React, { useEffect } from "react";
import {
  RiErrorWarningLine,
  RiCloseLine,
  RiMapPinLine,
  RiInformationLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
} from "react-icons/ri";

interface UniversalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  iconType?: "warning" | "info" | "location" | "success";
  children?: React.ReactNode;
}

const UniversalActionModal: React.FC<UniversalActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Accept & Continue",
  cancelLabel = "Cancel",
  iconType = "warning",
  children,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    warning: {
      icon: RiErrorWarningLine,
      color: "#f59e0b",
      bg: "#fffbeb",
      glow: "rgba(245, 158, 11, 0.15)",
    },
    info: {
      icon: RiInformationLine,
      color: "#3b82f6",
      bg: "#eff6ff",
      glow: "rgba(59, 130, 246, 0.15)",
    },
    location: {
      icon: RiMapPinLine,
      color: "#6366f1",
      bg: "#eef2ff",
      glow: "rgba(99, 102, 241, 0.15)",
    },
    success: {
      icon: RiCheckboxCircleLine,
      color: "#10b981",
      bg: "#ecfdf5",
      glow: "rgba(16, 185, 129, 0.15)",
    },
  };

  const { icon: Icon, color, bg, glow } = iconConfig[iconType];

  return (
    <div className="qw-modal-overlay" onClick={onClose}>
      <div
        className="qw-modal-content animate-pop-in"
        style={{ maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            opacity: 0.5,
            borderRadius: "36px 36px 0 0",
          }}
        />
        <button
          className="qw-modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          <RiCloseLine size={24} />
        </button>
        <div className="text-center">
          <div className="position-relative d-inline-block mb-4">
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "120px",
                height: "120px",
                background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
                zIndex: -1,
              }}
            />
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "28px",
                background: "white",
                color: color,
                boxShadow:
                  "0 12px 30px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(0,0,0,0.02)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "28px",
                  background: bg,
                  opacity: 0.4,
                }}
              />
              <Icon size={42} style={{ position: "relative" }} />
            </div>
          </div>

          <h3
            className="fw-bold text-dark mb-2 px-3"
            style={{
              fontFamily: "Syne, sans-serif",
              letterSpacing: "-0.03em",
              fontSize: "1.75rem",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h3>

          {message && (
            <p
              className="text-muted mb-4 px-4 mx-auto"
              style={{ fontSize: "15px", lineHeight: "1.6", maxWidth: "380px" }}
            >
              {message}
            </p>
          )}

          {children && (
            <div className="mb-4 text-start bg-light-subtle p-2 rounded-5 overflow-hidden transition-all">
              {children}
            </div>
          )}

          <div className="d-flex flex-column gap-3 mt-4">
            <button
              className="btn-action-primary"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              <span className="position-relative z-1 d-flex align-items-center justify-content-center gap-2">
                {confirmLabel}
                <RiArrowRightLine size={18} />
              </span>
            </button>

            <button
              className="btn btn-link text-muted fw-bold py-2 border-0 hover-opacity"
              onClick={onClose}
              style={{
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .qw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 5000;
          transition: all 0.3s ease;
        }

        .qw-modal-content {
          background: #ffffff;
          width: 100%;
          padding: 48px 40px 36px;
          border-radius: 42px;
          box-shadow:
            0 30px 60px -12px rgba(15, 23, 42, 0.2),
            0 18px 36px -18px rgba(15, 23, 42, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 1);
          position: relative;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .qw-modal-close-btn {
          position: absolute;
          top: 28px;
          right: 28px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: #94a3b8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .qw-modal-close-btn:hover {
          background: #ef4444;
          color: white;
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        .btn-action-primary {
          background: #0f172a;
          color: white;
          border: none;
          height: 64px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .btn-action-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.35);
          background: #1e293b;
        }

        .btn-action-primary:active {
          transform: translateY(-1px);
        }

        .animate-pop-in {
          animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hover-opacity:hover {
          opacity: 0.7;
          color: #0f172a !important;
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }

        @media (max-width: 576px) {
          .qw-modal-content {
            padding: 40px 24px 28px;
            border-radius: 32px;
          }
          .qw-modal-close-btn {
            top: 16px;
            right: 16px;
            width: 36px;
            height: 36px;
          }
          .btn-action-primary {
            height: 56px;
          }
        }
      `}</style>
    </div>
  );
};

export default UniversalActionModal;
