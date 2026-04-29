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

  // Location match check
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
        borderRadius: 16,
        border: "1px solid #e8edf4",
        marginBottom: 14,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        opacity: isRejected ? 0.65 : 1,
      }}
      onMouseEnter={e => {
        if (!isRejected) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.09)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top accent stripe */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}77)` }} />

      <div style={{ padding: "18px 20px 0" }}>

        {/* ── Status badges row ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#faf5ff", color: "#9333ea", border: "1px solid #e9d5ff", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
            <RiFlashlightLine size={10} /> Direct Invite
          </span>
          {isPending && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              ● Awaiting Response
            </span>
          )}
          {isAccepted && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              <RiCheckDoubleLine size={10} /> Accepted
            </span>
          )}
          {isRejected && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
              <RiCloseCircleLine size={10} /> Declined
            </span>
          )}
          {/* Location match */}
          {isMyArea === true && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", textTransform: "uppercase" as const }}>
              <RiMapPinLine size={10} /> Your Area
            </span>
          )}
          {isMyArea === false && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fff7ed", color: "#b45309", border: "1px solid #fde68a", textTransform: "uppercase" as const }}>
              <RiAlertLine size={10} /> Not Your Area
            </span>
          )}
        </div>

        {/* ── Header: client info + budget ── */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          {/* Avatar */}
          <div style={{ width: 44, height: 44, borderRadius: 11, background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14, boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}>
            {request.clientAvatarUrl
              ? <img src={request.clientAvatarUrl} alt={request.clientName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 11 }} />
              : initials}
          </div>

          {/* Title + client info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
              {request.title}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: "#334155", fontWeight: 600 }}>
                <RiUserLine size={11} color="#64748b" /> {request.clientName}
              </span>
              {request.isClientVerified && (
                <RiVerifiedBadgeLine size={13} color="#3b82f6" title="Verified client" />
              )}
              {request.clientRating !== undefined && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, color: "#64748b" }}>
                  <span style={{ color: "#f59e0b" }}>★</span> {request.clientRating.toFixed(1)}
                  {request.clientReviewsCount !== undefined && <span style={{ color: "#94a3b8" }}>({request.clientReviewsCount})</span>}
                </span>
              )}
            </div>
          </div>

          {/* Budget pill */}
          <div style={{ textAlign: "right", flexShrink: 0, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: "8px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
              <RiMoneyDollarCircleLine size={13} color="#6366f1" />
              <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif" }}>{request.budget}</span>
            </div>
            <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginTop: 1 }}>Per Provider</div>
          </div>
        </div>

        {/* ── Description ── */}
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
          <RiFileTextLine style={{ marginRight: 4, verticalAlign: "middle", color: "#94a3b8" }} />
          {request.description}
        </p>

        {/* ── Detail grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, background: "#f8fafc", borderRadius: 12, padding: "10px 12px", marginBottom: 16, border: "1px solid #f1f5f9" }}>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: isMyArea === false ? "#fff7ed" : "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: isMyArea === false ? "#b45309" : "#16a34a", fontSize: 13, flexShrink: 0, marginTop: 1 }}>
              <RiMapPinLine />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 1 }}>Location</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                {request.location?.address || "Not specified"}
              </div>
              {isMyArea === false && <div style={{ fontSize: 10, color: "#b45309", fontWeight: 600, marginTop: 1 }}>⚠ Outside your area</div>}
              {isMyArea === true  && <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 600, marginTop: 1 }}>✓ Your district</div>}
            </div>
          </div>

          {/* Duration */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 13, flexShrink: 0, marginTop: 1 }}>
              <RiTimeLine />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 1 }}>Duration</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                {DURATION_LABEL[request.durationType] ?? request.durationType?.replace(/_/g, " ") ?? "—"}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c", fontSize: 13, flexShrink: 0, marginTop: 1 }}>
              <RiCalendarEventLine />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 1 }}>
                {isMultiDay ? "Schedule" : "Date"}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                {isMultiDay ? `${request.startDate} → ${request.endDate}` : request.startDate}
              </div>
            </div>
          </div>

          {/* Providers needed */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333ea", fontSize: 13, flexShrink: 0, marginTop: 1 }}>
              <RiGroupLine />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 1 }}>Providers Needed</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                {request.freelancersNeeded ?? 1} provider{(request.freelancersNeeded ?? 1) > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* ── Skills ── */}
        {request.skills?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
            {request.skills.slice(0, 5).map(skill => (
              <span key={skill} style={{ padding: "2px 9px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#3b82f6" }}>
                {skill}
              </span>
            ))}
            {request.skills.length > 5 && (
              <span style={{ padding: "2px 9px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#94a3b8" }}>
                +{request.skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Action footer ── */}
      <div style={{ padding: "0 20px 18px", display: "flex", gap: 8, alignItems: "center" }}>
        {isPending ? (
          <>
            <button
              disabled={isActionLoading}
              onClick={() => onMessage?.(request.clientId, request.clientName)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 14px", height: 38, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: 12.5, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1"; (e.currentTarget as HTMLButtonElement).style.color = "#6366f1"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}
            >
              <RiMessage2Line size={15} /> Message
            </button>
            <button
              disabled={isActionLoading}
              onClick={() => onAccept(request.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, height: 38, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: isActionLoading ? "not-allowed" : "pointer", boxShadow: "0 3px 10px rgba(34,197,94,0.28)", transition: "all 0.2s", opacity: isActionLoading ? 0.7 : 1 }}
            >
              <RiCheckLine size={15} /> Accept
            </button>
            <button
              disabled={isActionLoading}
              onClick={() => onReject(request.id)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 14px", height: 38, borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff", color: "#dc2626", fontWeight: 600, fontSize: 12.5, cursor: isActionLoading ? "not-allowed" : "pointer", transition: "all 0.2s", flexShrink: 0, opacity: isActionLoading ? 0.7 : 1 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
            >
              <RiCloseLine size={15} /> Decline
            </button>
          </>
        ) : isAccepted ? (
          <button
            onClick={() => onMessage?.(request.clientId, request.clientName)}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, height: 38, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer", boxShadow: "0 3px 10px rgba(99,102,241,0.28)", transition: "all 0.2s" }}
          >
            <RiMessage2Line size={15} /> Message Client <RiArrowRightLine size={13} />
          </button>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 38, borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9", color: "#94a3b8", fontSize: 12.5, fontWeight: 500 }}>
            <RiCloseCircleLine size={15} /> This invitation was declined.
          </div>
        )}
      </div>
    </div>
  );
};
