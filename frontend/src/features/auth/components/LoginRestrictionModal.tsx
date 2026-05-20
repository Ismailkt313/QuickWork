import React from "react";
import { FiLock, FiLogOut, FiShieldOff } from "react-icons/fi";

interface LoginRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "restricted" | "expired" | "blocked";
}

const LoginRestrictionModal: React.FC<LoginRestrictionModalProps> = ({
  isOpen,
  onClose,
  type = "restricted",
}) => {
  if (!isOpen) return null;

  const config = {
    restricted: {
      icon: <FiLock />,
      title: "Authentication Required",
      message:
        "Please log in to explore all the features of QuickWork. Join our community to connect with top service providers.",
      btnText: "Continue to Login",
      gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    },
    expired: {
      icon: <FiLogOut />,
      title: "Session Expired",
      message:
        "For your security, your session has ended. Please log in again to continue managing your projects.",
      btnText: "Log In Again",
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    },
    blocked: {
      icon: <FiShieldOff />,
      title: "Access Restricted",
      message:
        "Your account has been restricted by an administrator. Please contact support if you believe this is an error.",
      btnText: "Return to Home",
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    },
  }[type];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "lrmFadeIn 0.3s ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "32px",
          width: "100%",
          maxWidth: "440px",
          padding: "48px 32px",
          textAlign: "center",
          boxShadow: "0 40px 100px rgba(0, 0, 0, 0.15)",
          animation: "lrmSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: config.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: "#fff",
            margin: "0 auto 32px",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
          }}
        >
          {config.icon}
        </div>

        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 16px",
            letterSpacing: "-0.5px",
          }}
        >
          {config.title}
        </h2>

        <p
          style={{
            fontSize: 15,
            color: "#64748b",
            lineHeight: 1.6,
            margin: "0 0 40px",
            fontWeight: 500,
          }}
        >
          {config.message}
        </p>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            background: config.gradient,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          {config.btnText}
        </button>

        <div style={{ marginTop: 24 }}>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              background: "none",
              border: "none",
              fontSize: 13,
              color: "#94a3b8",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Not now, just browsing
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes lrmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lrmSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `,
        }}
      />
    </div>
  );
};

export default LoginRestrictionModal;
