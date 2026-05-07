import React, { useEffect } from "react";
import {
  RiErrorWarningLine,
  RiCloseLine,
  RiCalendarEventLine,
  RiAlertLine,
  RiArrowRightLine,
} from "react-icons/ri";

interface ActionErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  type?: "error" | "warning";
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const ActionErrorModal: React.FC<ActionErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Action Prohibited",
  message = "An unexpected error occurred. Please try again.",
  type = "error",
  primaryAction,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isOverlap =
    message.toLowerCase().includes("overlap") ||
    message.toLowerCase().includes("schedule");
  const Icon = isOverlap
    ? RiCalendarEventLine
    : type === "warning"
      ? RiAlertLine
      : RiErrorWarningLine;

  const colors = {
    error: { color: "#ef4444", bg: "#fef2f2", glow: "rgba(239, 68, 68, 0.15)" },
    warning: {
      color: "#f59e0b",
      bg: "#fffbeb",
      glow: "rgba(245, 158, 11, 0.15)",
    },
    overlap: {
      color: "#6366f1",
      bg: "#eef2ff",
      glow: "rgba(99, 102, 241, 0.15)",
    },
  };

  const { color, bg, glow } = colors[isOverlap ? "overlap" : type];

  return (
    <div className="qw-modal-overlay" onClick={onClose}>
      <div
        className="qw-modal-content animate-pop-in"
        style={{ maxWidth: "440px" }}
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
            borderRadius: "42px 42px 0 0",
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
                width: "110px",
                height: "110px",
                background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
                zIndex: -1,
              }}
            />
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "26px",
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
                  borderRadius: "26px",
                  background: bg,
                  opacity: 0.4,
                }}
              />
              <Icon size={40} style={{ position: "relative" }} />
            </div>
          </div>

          <h3
            className="fw-bold text-dark mb-2 px-3"
            style={{
              fontFamily: "Syne, sans-serif",
              letterSpacing: "-0.03em",
              fontSize: "1.6rem",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h3>

          <div
            className="p-3 rounded-4 mb-4 mx-auto"
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #f3f4f6",
              maxWidth: "360px",
            }}
          >
            <p
              className="text-muted mb-0 small"
              style={{ fontSize: "14.5px", lineHeight: "1.6" }}
            >
              {message}
            </p>
          </div>
          <div className="d-flex flex-column gap-3 mt-4">
            {primaryAction && (
              <button
                className="btn-action-primary"
                onClick={() => {
                  primaryAction.onClick();
                  onClose();
                }}
              >
                <span className="position-relative z-1 d-flex align-items-center justify-content-center gap-2">
                  {primaryAction.label}
                  <RiArrowRightLine size={18} />
                </span>
              </button>
            )}

            <button
              className="btn btn-link text-muted fw-bold py-2 border-0 hover-opacity"
              onClick={onClose}
              style={{
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Dismiss
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
        }

        .qw-modal-content {
          background: #ffffff;
          width: 100%;
          padding: 48px 40px 36px;
          border-radius: 42px;
          box-shadow:
            0 30px 60px -12px rgba(15, 23, 42, 0.2),
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
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .qw-modal-close-btn:hover {
          background: #ef4444;
          color: white;
          transform: rotate(90deg);
        }

        .btn-action-primary {
          background: #0f172a;
          color: white;
          border: none;
          height: 60px;
          border-radius: 18px;
          font-weight: 700;
          font-size: 15px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.2);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-action-primary:hover {
          transform: translateY(-2px);
          background: #1e293b;
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
          .qw-modal-content { padding: 40px 24px 28px; border-radius: 32px; }
          .qw-modal-close-btn { top: 16px; right: 16px; width: 36px; height: 36px; }
        }
      `}</style>
    </div>
  );
};

export default ActionErrorModal;
