import React, { useState } from "react";
import { ROLES } from "../../../constants/roles";
import type { IServiceProviderDetails } from "../types/admin.types";

interface UserDetail {
  _id: string;
  id?: string;
  name: string;
  email: string;
  number?: string;
  role: ROLES;
  isBlocked: boolean;
  createdAt: string;
}

interface UserDetailModalProps {
  user: UserDetail;
  providerProfile?: IServiceProviderDetails | null;
  onClose: () => void;
  onToggleBlock: (userId: string) => Promise<void>;
}

/* ── Tabs ── */
type Tab = "user" | "provider";

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  providerProfile,
  onClose,
}) => {
  const hasProvider = user.role === ROLES.PROVIDER && !!providerProfile;
  const [activeTab, setActiveTab] = useState<Tab>("user");

  const getRoleBadgeClass = (role: ROLES) => {
    if (role === ROLES.PROVIDER) return "provider";
    if (role === ROLES.ADMIN) return "admin";
    return "user";
  };

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
          maxWidth: hasProvider ? 620 : 500,
          width: "95%",
          padding: 0,
          borderRadius: 24,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b, #334155)",
            padding: "28px 32px 20px",
            color: "#fff",
            position: "relative",
            textAlign: "center",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
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
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
          >
            <i className="bi bi-x-lg"></i>
          </button>

          {/* Avatar */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background:
                providerProfile?.profileImage
                  ? `url(${providerProfile.profileImage}) center/cover`
                  : "#fff",
              color: "#1e293b",
              fontSize: 28,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              border: "3px solid rgba(255,255,255,0.15)",
            }}
          >
            {!providerProfile?.profileImage &&
              user.name.charAt(0).toUpperCase()}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>
            {user.name}
          </h2>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
              {user.role}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                background: user.isBlocked ? "#ef4444" : "#10b981",
                color: "#fff",
              }}
            >
              {user.isBlocked ? "Blocked" : "Active"}
            </span>
          </div>

          {/* Tab bar (only if user is also a provider) */}
          {hasProvider && (
            <div
              style={{
                display: "flex",
                gap: 0,
                marginTop: 18,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 3,
              }}
            >
              {(
                [
                  { key: "user" as Tab, label: "User Profile", icon: "bi-person" },
                  { key: "provider" as Tab, label: "Provider Profile", icon: "bi-briefcase" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background:
                      activeTab === tab.key
                        ? "rgba(255,255,255,0.18)"
                        : "transparent",
                    color:
                      activeTab === tab.key
                        ? "#fff"
                        : "rgba(255,255,255,0.5)",
                  }}
                >
                  <i className={`bi ${tab.icon}`} style={{ fontSize: 14 }}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "24px 32px 28px", overflowY: "auto" }}>
          {activeTab === "user" ? (
            <UserTab user={user} />
          ) : (
            providerProfile && <ProviderTab provider={providerProfile} />
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════ User Tab ═══════════════ */
const UserTab: React.FC<{ user: UserDetail }> = ({ user }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <DetailRow icon="bi-envelope" label="Email" value={user.email} />
    <DetailRow
      icon="bi-telephone"
      label="Phone"
      value={user.number || "Not provided"}
    />
    <DetailRow
      icon="bi-calendar-check"
      label="Joined On"
      value={new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    />
  </div>
);

/* ═══════════════ Provider Tab ═══════════════ */
const ProviderTab: React.FC<{ provider: IServiceProviderDetails }> = ({
  provider,
}) => {
  const verificationColor: Record<string, { bg: string; color: string }> = {
    verified: { bg: "#dcfce7", color: "#166534" },
    pending: { bg: "#fef3c7", color: "#92400e" },
    rejected: { bg: "#fee2e2", color: "#991b1b" },
  };

  const vStatus = provider.verification?.status?.toLowerCase() || "pending";
  const vStyle = verificationColor[vStatus] || verificationColor.pending;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Headline */}
      {provider.headline && (
        <div>
          <SectionLabel>Headline</SectionLabel>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: "#1e293b",
              lineHeight: 1.6,
            }}
          >
            {provider.headline}
          </p>
        </div>
      )}

      {/* About */}
      {provider.about && (
        <div>
          <SectionLabel>About</SectionLabel>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {provider.about}
          </p>
        </div>
      )}

      {/* Key info grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <InfoCard
          icon="bi-clock-history"
          label="Experience"
          value={`${provider.yearsOfExperience} yrs`}
        />
        <InfoCard
          icon="bi-currency-rupee"
          label="Hourly Rate"
          value={`₹${provider.hourlyRate?.toLocaleString()}`}
        />
        <InfoCard
          icon="bi-geo-alt"
          label="Location"
          value={provider.location?.name || "—"}
        />
        <InfoCard
          icon="bi-patch-check"
          label="Status"
          value={provider.isActive ? "Active" : "Inactive"}
          valueColor={provider.isActive ? "#16a34a" : "#94a3b8"}
        />
      </div>

      {/* Verification */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderRadius: 12,
          background: vStyle.bg,
          border: `1px solid ${vStyle.color}22`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: vStyle.color,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 2,
            }}
          >
            Verification
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: vStyle.color }}>
            {vStatus.charAt(0).toUpperCase() + vStatus.slice(1)}
          </div>
        </div>
        <i
          className={`bi ${
            vStatus === "verified"
              ? "bi-check-circle-fill"
              : vStatus === "rejected"
                ? "bi-x-circle-fill"
                : "bi-hourglass-split"
          }`}
          style={{ fontSize: 22, color: vStyle.color }}
        ></i>
      </div>

      {provider.verification?.rejectionReason && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#dc2626",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 4,
            }}
          >
            Rejection Reason
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#7f1d1d", lineHeight: 1.6 }}>
            {provider.verification.rejectionReason}
          </p>
        </div>
      )}

      {/* Skills */}
      {provider.skills && provider.skills.length > 0 && (
        <div>
          <SectionLabel>Skills</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {provider.skills.map((skill) => (
              <span
                key={skill._id}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════ Helper components ═══════════════ */

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      marginBottom: 8,
    }}
  >
    {children}
  </div>
);

const InfoCard: React.FC<{
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}> = ({ icon, label, value, valueColor }) => (
  <div
    style={{
      padding: "12px 14px",
      borderRadius: 12,
      background: "#f8fafc",
      border: "1px solid #f1f5f9",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
      }}
    >
      <i
        className={`bi ${icon}`}
        style={{ fontSize: 13, color: "#94a3b8" }}
      ></i>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
    </div>
    <div
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: valueColor || "#1e293b",
      }}
    >
      {value}
    </div>
  </div>
);

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontSize: 18,
        flexShrink: 0,
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
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>
        {value}
      </div>
    </div>
  </div>
);

export default UserDetailModal;
