import React, { useEffect } from "react";
import type { IServiceProviderDetails } from "../types/admin.types";
import { VERIFICATION_STATUS } from "../../../constants/verification";

interface ProviderProfileModalProps {
  provider: IServiceProviderDetails;
  onClose: () => void;
}

const ProviderProfileModal: React.FC<ProviderProfileModalProps> = ({
  provider,
  onClose,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="confirm-modal-overlay"
      style={{
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="confirm-modal-card"
        style={{
          maxWidth: "700px",
          width: "95%",
          padding: "0",
          borderRadius: "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            padding: "40px 32px",
            color: "#fff",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>

          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "24px",
                background: "#fff",
                overflow: "hidden",
                border: "4px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}
            >
              {provider.profileImage ? (
                <img
                  src={provider.profileImage}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    color: "#0f172a",
                    fontWeight: 700,
                    background: "#f1f5f9",
                  }}
                >
                  {provider.userId.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>
                {provider.userId.name}
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#94a3b8",
                  margin: "0 0 12px",
                  fontWeight: 500,
                }}
              >
                {provider.headline}
              </p>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  background:
                    provider.verification.status === VERIFICATION_STATUS.VERIFIED
                      ? "#059669"
                      : "#d97706",
                }}
              >
                {provider.verification.status}
              </span>
            </div>
          </div>
        </div>

        {}
        <div style={{ padding: "32px", overflowY: "auto", flexGrow: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <InfoItem
              icon="bi-envelope"
              label="Email Address"
              value={provider.userId.email}
            />
            <InfoItem
              icon="bi-telephone"
              label="Phone Number"
              value={provider.userId.phone || "Not provided"}
            />
            <InfoItem
              icon="bi-geo-alt"
              label="Location"
              value={provider.location.name}
            />
            <InfoItem
              icon="bi-briefcase"
              label="Experience"
              value={`${provider.yearsOfExperience} Years`}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <SectionTitle title="About Provider" />
            <p
              style={{
                fontSize: 15,
                color: "#475569",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {provider.about}
            </p>
          </div>

          <div>
            <SectionTitle title="Skills & Expertise" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {provider.skills.map((skill) => (
                <span
                  key={skill._id}
                  style={{
                    padding: "6px 14px",
                    background: "#f1f5f9",
                    color: "#334155",
                    borderRadius: "10px",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "24px 32px",
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            textAlign: "right",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              background: "#0f172a",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#3b82f6",
        fontSize: 16,
      }}
    >
      <i className={`bi ${icon}`}></i>
    </div>
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
        {value}
      </div>
    </div>
  </div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h3
    style={{
      fontSize: 14,
      fontWeight: 800,
      color: "#0f172a",
      marginBottom: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}
  >
    {title}
  </h3>
);

export default ProviderProfileModal;
