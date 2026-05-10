import React from "react";
import {
  RiMapPinLine,
  RiTimeLine,
  RiCalendarEventLine,
  RiCheckLine,
  RiCloseLine,
  RiMessage2Line,
  RiMoneyDollarCircleLine,
  RiArrowRightLine,
  RiFileTextLine,
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiGroupLine,
  RiAlertLine,
  RiVerifiedBadgeLine,
  RiUserLine,
  RiFlashlightLine,
} from "react-icons/ri";
import type { JobDetail } from "../types/job";
import { useProviderLocation } from "../hooks/useProviderLocation";

interface RequestCardProps {
  request: JobDetail;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onMessage?: (clientId: string, clientName: string) => void;
  isActionLoading?: boolean;
}

const DURATION_LABEL: Record<string, string> = {
  half_day: "Half Day (~4 hrs)",
  full_day: "Full Day (8 hrs)",
  multi_day: "Multiple Days",
};

const AVATAR_COLORS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#06b6d4,#0ea5e9)",
  "linear-gradient(135deg,#f97316,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#22c55e,#16a34a)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
];
const getAvatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onAccept,
  onReject,
  onMessage,
  isActionLoading,
}) => {
  const isPending  = request.status === "open";
  const isAccepted = request.status === "fully_assigned";
  const isRejected = request.status === "cancelled" || request.status === "rejected";

  const providerLocation = useProviderLocation();

  const jobDistrict = request.location?.districtName?.toLowerCase().trim() ?? "";
  const myDistrict  = providerLocation?.toLowerCase().trim() ?? "";
  const isMyArea = myDistrict && myDistrict !== "not set" && jobDistrict
    ? jobDistrict.includes(myDistrict) || myDistrict.includes(jobDistrict)
    : null;

  const accentColor = isPending ? "#6366f1" : isAccepted ? "#16a34a" : "#94a3b8";

  const avatarBg = getAvatarColor(request.clientName);
  const initials = request.clientInitials ||
    (request.clientName ? request.clientName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?");

  const isMultiDay = request.startDate !== request.endDate;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid #f1f5f9",
        marginBottom: "18px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 10px 25px -5px rgba(0,0,0,0.03)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isRejected ? 0.75 : 1,
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!isRejected) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px -12px rgba(0,0,0,0.08)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.02), 0 10px 25px -5px rgba(0,0,0,0.03)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9";
      }}
    >
      {/* --- Top Progress/Accent Line --- */}
      <div style={{ 
        height: "4px", 
        background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}33 100%)`,
        opacity: 0.8 
      }} />

      <div style={{ padding: "24px 24px 20px" }}>
        
        {/* --- Header Section: Badges --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "4px", 
              padding: "4px 10px", 
              borderRadius: "8px", 
              fontSize: "10px", 
              fontWeight: 800, 
              background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", 
              color: "#7c3aed",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              border: "1px solid #ddd6fe"
            }}>
              <RiFlashlightLine size={12} /> Direct Invitation
            </span>

            {isPending && (
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "4px", 
                padding: "4px 10px", 
                borderRadius: "8px", 
                fontSize: "10px", 
                fontWeight: 800, 
                background: "#f0f9ff", 
                color: "#0369a1",
                textTransform: "uppercase",
                border: "1px solid #bae6fd"
              }}>
                Awaiting your response
              </span>
            )}
            
            {isAccepted && (
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "4px", 
                padding: "4px 10px", 
                borderRadius: "8px", 
                fontSize: "10px", 
                fontWeight: 800, 
                background: "#f0fdf4", 
                color: "#15803d",
                textTransform: "uppercase",
                border: "1px solid #bbf7d0"
              }}>
                <RiCheckDoubleLine size={12} /> Active Assignment
              </span>
            )}
          </div>

          <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", fontFamily: "monospace" }}>
            REF: {request.jobCode}
          </div>
        </div>

        {/* --- Main Content Section --- */}
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "24px" }}>
          {/* Client Avatar */}
          <div style={{ position: "relative" }}>
            <div style={{ 
              width: "56px", 
              height: "56px", 
              borderRadius: "16px", 
              background: avatarBg, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#fff", 
              fontFamily: "Syne, sans-serif", 
              fontWeight: 800, 
              fontSize: "18px",
              boxShadow: "0 8px 16px -4px rgba(0,0,0,0.1)",
              border: "2px solid #fff"
            }}>
              {request.clientAvatarUrl 
                ? <img src={request.clientAvatarUrl} alt={request.clientName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "14px" }} />
                : initials}
            </div>
            {request.isClientVerified && (
              <div style={{ 
                position: "absolute", 
                bottom: "-4px", 
                right: "-4px", 
                background: "#fff", 
                borderRadius: "50%", 
                padding: "2px",
                display: "flex"
              }}>
                <RiVerifiedBadgeLine size={18} color="#3b82f6" />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ 
              margin: "0 0 6px", 
              fontSize: "18px", 
              fontWeight: 800, 
              color: "#0f172a", 
              fontFamily: "Syne, sans-serif", 
              lineHeight: 1.2,
              letterSpacing: "-0.02em"
            }}>
              {request.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>{request.clientName}</span>
              </div>
              {request.clientRating !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fffbeb", padding: "2px 8px", borderRadius: "6px", border: "1px solid #fef3c7" }}>
                  <span style={{ color: "#d97706", fontSize: "12px" }}>★</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#92400e" }}>{request.clientRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Budget Widget */}
          <div style={{ textAlign: "right", background: "#f8fafc", padding: "10px 16px", borderRadius: "14px", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Offer Amount</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif" }}>{request.budget}</div>
          </div>
        </div>

        {/* --- Description Segment --- */}
        <div style={{ marginBottom: "24px" }}>
          <p style={{ 
            margin: 0, 
            fontSize: "13.5px", 
            color: "#64748b", 
            lineHeight: 1.6, 
            display: "-webkit-box", 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: "vertical", 
            overflow: "hidden" 
          }}>
            {request.description}
          </p>
        </div>

        {/* --- Metadata Grid --- */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", 
          gap: "12px", 
          background: "#fafafa", 
          padding: "16px", 
          borderRadius: "16px",
          border: "1px solid #f1f5f9"
        }}>
          {/* Location */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: isMyArea === false ? "#f97316" : "#10b981", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiMapPinLine size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Location</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {request.location?.address?.split(',')[0] || "Remote"}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiCalendarEventLine size={16} />
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>{isMultiDay ? "Dates" : "Date"}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                {isMultiDay ? `${request.startDate.split(',')[0]}...` : request.startDate}
              </div>
            </div>
          </div>

          {/* Timing */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiTimeLine size={16} />
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Duration</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>{DURATION_LABEL[request.durationType] || "Custom"}</div>
            </div>
          </div>

          {/* Capacity */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiGroupLine size={16} />
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Openings</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>{request.freelancersNeeded || 1} Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Footer Action Bar --- */}
      <div style={{ 
        padding: "16px 24px", 
        background: "#fcfcfd", 
        borderTop: "1px solid #f1f5f9", 
        display: "flex", 
        gap: "12px",
        alignItems: "center"
      }}>
        {isPending ? (
          <>
            <button
              disabled={isActionLoading}
              onClick={() => onMessage?.(request.clientId, request.clientName)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                padding: "0 18px", 
                height: "42px", 
                borderRadius: "12px", 
                border: "1.5px solid #e2e8f0", 
                background: "#fff", 
                color: "#475569", 
                fontWeight: 700, 
                fontSize: "13px", 
                cursor: "pointer", 
                transition: "all 0.2s" 
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1"; (e.currentTarget as HTMLButtonElement).style.color = "#6366f1"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}
            >
              <RiMessage2Line size={18} /> Chat
            </button>
            <div style={{ flex: 1 }} />
            <button
              disabled={isActionLoading}
              onClick={() => onReject(request.id)}
              style={{ 
                padding: "0 18px", 
                height: "42px", 
                borderRadius: "12px", 
                border: "none", 
                background: "transparent", 
                color: "#94a3b8", 
                fontWeight: 700, 
                fontSize: "13px", 
                cursor: "pointer",
                transition: "color 0.2s"
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8"; }}
            >
              Decline
            </button>
            <button
              disabled={isActionLoading}
              onClick={() => onAccept(request.id)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                padding: "0 24px", 
                height: "42px", 
                borderRadius: "12px", 
                border: "none", 
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", 
                color: "#fff", 
                fontWeight: 800, 
                fontSize: "13.5px", 
                cursor: isActionLoading ? "not-allowed" : "pointer", 
                boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
                transition: "all 0.2s" 
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(99,102,241,0.35)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.25)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              {isActionLoading ? "Processing..." : "Accept Invitation"}
              {!isActionLoading && <RiArrowRightLine size={16} />}
            </button>
          </>
        ) : isAccepted ? (
          <button
            onClick={() => onMessage?.(request.clientId, request.clientName)}
            style={{ 
              flex: 1, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px", 
              height: "42px", 
              borderRadius: "12px", 
              border: "none", 
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
              color: "#fff", 
              fontWeight: 800, 
              fontSize: "14px", 
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16,185,129,0.25)"
            }}
          >
            <RiMessage2Line size={18} /> Message Client
          </button>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "13px", fontWeight: 600 }}>
            <RiCloseCircleLine size={18} /> This invitation was declined.
          </div>
        )}
      </div>
    </div>
  );
};

