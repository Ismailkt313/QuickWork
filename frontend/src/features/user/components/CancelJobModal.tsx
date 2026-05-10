import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiAlertOctagon } from "react-icons/fi";

interface CancelJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling?: boolean;
}

export const CancelJobModal: React.FC<CancelJobModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCancelling = false,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="qw-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        background: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        animation: "qwFadeIn 0.2s ease",
      }}
    >
      <div
        className="qw-modal-content"
        style={{
          background: "#fff",
          borderRadius: isMobile ? "24px 24px 0 0" : 24,
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
          animation: isMobile ? "qwMobileSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" : "qwSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)",
          margin: isMobile ? "0" : "20px",
          position: isMobile ? "fixed" : "relative",
          bottom: isMobile ? 0 : "auto",
        }}
      >
        {isMobile && (
          <div style={{ 
            width: 40, 
            height: 4, 
            background: "#e2e8f0", 
            borderRadius: 2, 
            margin: "12px auto 0",
            flexShrink: 0
          }} />
        )}
        <div style={{ padding: isMobile ? "24px 24px 16px" : "32px 32px 24px", textAlign: "center" }}>
          <div
            style={{
              width: isMobile ? 56 : 64,
              height: isMobile ? 56 : 64,
              borderRadius: "50%",
              background: "#fee2e2",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isMobile ? 28 : 32,
              margin: "0 auto 20px",
              boxShadow: "0 0 0 8px rgba(239, 68, 68, 0.1)",
            }}
          >
            <FiAlertOctagon />
          </div>

          <h4
            style={{
              margin: "0 0 8px",
              fontWeight: 800,
              fontSize: isMobile ? 20 : 22,
              color: "#0f172a",
              fontFamily: "Syne, sans-serif",
              letterSpacing: "-0.5px",
            }}
          >
            Cancel this job?
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? 14 : 14.5,
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            Are you sure you want to cancel this job? This action cannot be
            undone. If any provider was already assigned, they will be notified.
          </p>
        </div>

        <div
          style={{
            padding: isMobile ? "20px 24px calc(20px + env(safe-area-inset-bottom))" : "24px 32px",
            background: "#f8fafc",
            display: "flex",
            flexDirection: isMobile ? "column-reverse" : "row",
            gap: 12,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <button
            onClick={onClose}
            disabled={isCancelling}
            style={{
              flex: 1,
              padding: isMobile ? "14px" : "12px",
              borderRadius: 14,
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              border: "1px solid #e2e8f0",
              transition: "all 0.2s",
              cursor: isCancelling ? "not-allowed" : "pointer",
              fontSize: isMobile ? 15 : 14,
            }}
          >
            Keep Job
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            style={{
              flex: 1,
              padding: isMobile ? "14px" : "12px",
              borderRadius: 14,
              background: "#ef4444",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              transition: "all 0.2s",
              boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
              cursor: isCancelling ? "not-allowed" : "pointer",
              fontSize: isMobile ? 15 : 14,
            }}
          >
            {isCancelling ? "Cancelling..." : "Yes, Cancel Job"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes qwFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qwSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes qwMobileSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
