import React from "react";
import {
  RiCalendarLine,
  RiMapPinLine,
  RiUser3Line,
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
  const { job, workStatus, schedule, type } = assignment;
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
        borderRadius: "20px",
        border: "1px solid #f1f5f9",
        marginBottom: "18px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 10px 25px -5px rgba(0,0,0,0.03)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px -12px rgba(0,0,0,0.08)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.02), 0 10px 25px -5px rgba(0,0,0,0.03)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9";
      }}
    >
      {/* --- Progress Accent Line --- */}
      <div style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "4px", 
        background: `linear-gradient(90deg, ${status.text}, ${status.text}33)` 
      }} />

      <div style={{ padding: "24px 24px 20px" }}>
        {/* --- Header: Status & Type --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              padding: "4px 12px", 
              borderRadius: "8px", 
              fontSize: "10px", 
              fontWeight: 800, 
              background: status.bg, 
              color: status.text, 
              border: `1px solid ${status.border}`, 
              textTransform: "uppercase", 
              letterSpacing: "0.05em" 
            }}>
              {status.icon} {status.label}
            </span>
            
            {type === "direct" ? (
              <span style={{ 
                padding: "4px 10px", 
                borderRadius: "8px", 
                fontSize: "10px", 
                fontWeight: 800, 
                background: "#f5f3ff", 
                color: "#7c3aed", 
                border: "1px solid #ddd6fe", 
                textTransform: "uppercase" 
              }}>
                Direct Hire
              </span>
            ) : (
              <span style={{ 
                padding: "4px 10px", 
                borderRadius: "8px", 
                fontSize: "10px", 
                fontWeight: 800, 
                background: "#f0fdf4", 
                color: "#15803d", 
                border: "1px solid #bbf7d0", 
                textTransform: "uppercase" 
              }}>
                Open Job
              </span>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
              <RiMoneyDollarCircleLine size={16} color="#6366f1" />
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif" }}>
                ₹{assignment.payment?.amount ?? job.budget}
              </span>
            </div>
            <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>
              {assignment.payment?.amount ? "Final Payout" : "Total Budget"}
            </div>
          </div>
        </div>

        {/* --- Title Section --- */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ 
            margin: "0 0 6px", 
            fontSize: "18px", 
            fontWeight: 800, 
            color: "#0f172a", 
            fontFamily: "Syne, sans-serif", 
            lineHeight: 1.2,
            letterSpacing: "-0.02em"
          }}>
            {job.title}
          </h3>
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
            {job.description}
          </p>
        </div>

        {/* --- Info Grid --- */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: "12px", 
          background: "#fafafa", 
          padding: "16px", 
          borderRadius: "16px",
          border: "1px solid #f1f5f9",
          marginBottom: "16px"
        }}>
          {/* Client */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiUser3Line size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Client</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.clientName}
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiMapPinLine size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Location</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.location?.address?.split(',')[0] || "Remote"}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiCalendarLine size={16} />
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Schedule</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                {formatDate(startDate)}{isMultiDay ? "..." : ""}
              </div>
            </div>
          </div>

          {/* Type */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <RiBriefcaseLine size={16} />
            </div>
            <div>
              <div style={{ fontSize: "9px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Duration</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>
                {job.durationType ? (DURATION_LABEL[job.durationType] || "Custom") : "Standard"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Footer Actions --- */}
      <div style={{ 
        padding: "16px 24px", 
        background: "#fcfcfd", 
        borderTop: "1px solid #f1f5f9", 
        display: "flex", 
        gap: "12px",
        alignItems: "center"
      }}>
        <button
          onClick={() => onMessage?.(job.clientId, job.clientName)}
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
          onClick={() => onViewDetails?.(assignment.id)}
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
            cursor: "pointer", 
            boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
            transition: "all 0.2s" 
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(99,102,241,0.35)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(99,102,241,0.25)"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        >
          Manage Work <RiArrowRightLine size={16} />
        </button>
      </div>
    </div>
  );
};

export default MyJobCard;
