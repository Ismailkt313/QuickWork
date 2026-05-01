import React from "react";
import {
  RiCalendarLine,
  RiMapPinLine,
  RiUser3Line,
  RiTimeLine,
  RiMapPinRangeLine,
  RiArrowRightLine,
  RiMessage2Line,
  RiDoorOpenLine,
  RiToolsLine,
  RiCheckDoubleLine,
  RiProhibitedLine,
  RiAlertLine,
  RiBriefcaseLine,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";

interface MyJobCardProps {
  assignment: {
    id: string;
    job: {
      id: string;
      clientId: string;
      title: string;
      description: string;
      clientName: string;
      location: {
        address: string;
        lat: number;
        lng: number;
        districtId: string;
        districtName?: string;
      } | null;
      budget: string;
      durationType?: string;
      days?: number;
    } | null;
    workStatus: "assigned" | "in_progress" | "completed" | "cancelled" | "absent";
    schedule: {
      startDate: string;
      endDate: string;
    };
    assignedAt: string;
    isOutOfDistrict: boolean;
    type: "open" | "direct";
    payment?: {
      status: string;
      method?: string;
      amount: number;
    };
  };
  onViewDetails?: (id: string) => void;
  onMessage?: (clientId: string, clientName: string) => void;
}

const STATUS_MAP: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  assigned:    { bg: "#eff6ff", text: "#3b82f6", border: "#bfdbfe", icon: <RiDoorOpenLine />, label: "Assigned" },
  in_progress: { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa", icon: <RiToolsLine />, label: "In Progress" },
  completed:   { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", icon: <RiCheckDoubleLine />, label: "Completed" },
  cancelled:   { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", icon: <RiProhibitedLine />, label: "Cancelled" },
  absent:      { bg: "#fffbeb", text: "#b45309", border: "#fde68a", icon: <RiAlertLine />, label: "Absent" },
};

const DURATION_LABEL: Record<string, string> = {
  half_day: "Half Day (~4 hrs)",
  full_day: "Full Day (8 hrs)",
  multi_day: "Multiple Days",
};

const MyJobCard: React.FC<MyJobCardProps> = ({ assignment, onViewDetails, onMessage }) => {
  const { job, workStatus, schedule, isOutOfDistrict, type } = assignment;
  if (!job) return null;

  const status = STATUS_MAP[workStatus] ?? STATUS_MAP["assigned"];
  const startDate = new Date(schedule.startDate);
  const endDate = new Date(schedule.endDate);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();

  const formatDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #e8edf4",
        marginBottom: 16,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.07)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: `linear-gradient(90deg, ${status.text}, ${status.text}88)` }} />

      <div style={{ padding: "20px 24px 0" }}>
        {}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: status.bg, color: status.text, border: `1px solid ${status.border}`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {status.icon} {status.label}
            </span>
            {}
            {type === "direct" && (
              <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#faf5ff", color: "#9333ea", border: "1px solid #e9d5ff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Direct Hire
              </span>
            )}
            {type === "open" && (
              <span style={{ padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Open Job
              </span>
            )}
            {isOutOfDistrict && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <RiMapPinRangeLine /> Out of Zone
              </span>
            )}
            {}
            {workStatus === "completed" && assignment.payment?.status !== "completed" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <RiMoneyDollarCircleLine size={13} /> Payment Pending
              </span>
            )}
          </div>
          {}
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
              <RiMoneyDollarCircleLine size={16} color="#6366f1" />
              <span style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif" }}>
                ₹{assignment.payment?.amount ?? job.budget}
              </span>
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 1 }}>
              {assignment.payment?.amount ? "Total Payment" : "Est. Per Provider"}
            </div>
          </div>
        </div>

        {}
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif", lineHeight: 1.3 }}>
            <RiBriefcaseLine style={{ marginRight: 6, color: "#6366f1", verticalAlign: "middle", fontSize: 16 }} />
            {job.title}
          </h3>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {job.description}
          </p>
        </div>

        {}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, background: "#f8fafc", borderRadius: 12, padding: "12px 14px", marginBottom: 16, border: "1px solid #f1f5f9" }}>
          {}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 15, flexShrink: 0 }}>
              <RiUser3Line />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Client</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>{job.clientName}</div>
            </div>
          </div>
          {}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", fontSize: 15, flexShrink: 0 }}>
              <RiMapPinLine />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Location</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>{job.location?.address || "Not specified"}</div>
            </div>
          </div>
          {}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", color: "#ea580c", fontSize: 15, flexShrink: 0 }}>
              <RiCalendarLine />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Schedule</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>
                {formatDate(startDate)}{isMultiDay ? ` → ${formatDate(endDate)}` : ""}
              </div>
            </div>
          </div>
          {}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#9333ea", fontSize: 15, flexShrink: 0 }}>
              <RiTimeLine />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Duration</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>
                {job.durationType ? (DURATION_LABEL[job.durationType] ?? job.durationType) : "—"}
                {job.durationType === "multi_day" && job.days ? ` (${job.days} days)` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
        <button
          onClick={() => onMessage?.(job.clientId, job.clientName)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1"; (e.currentTarget as HTMLButtonElement).style.color = "#6366f1"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.color = "#475569"; }}
        >
          <RiMessage2Line size={16} /> Message
        </button>
        <button
          onClick={() => onViewDetails?.(assignment.id)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)", transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(99,102,241,0.45)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(99,102,241,0.3)"; }}
        >
          Manage Assignment <RiArrowRightLine size={16} />
        </button>
      </div>
    </div>
  );
};

export default MyJobCard;
