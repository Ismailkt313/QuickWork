import React from "react";
import {
  RiMapPinLine,
  RiFocus2Line,
  RiArrowRightSLine,
} from "react-icons/ri";
import type { UserJob } from "../services/userJob.service";
import "./style/compactUserJobCard.css";

interface CompactUserJobCardProps {
  job: UserJob;
  onView?: (id: string) => void;
}

const CompactUserJobCard: React.FC<CompactUserJobCardProps> = ({ job, onView }) => {
  const isPrivate = job.visibility === "private";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return { label: "Pending", color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" };
      case "in_progress":
        return { label: "Ongoing", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" };
      case "completed":
        return { label: "Completed", color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" };
      case "cancelled":
        return { label: "Cancelled", color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" };
      default:
        return { label: status, color: "#64748b", bg: "rgba(100, 116, 139, 0.1)" };
    }
  };

  const status = getStatusConfig(job.status);
  const skillName = (job.skills && job.skills.length > 0) ? job.skills[0] : (job.categoryName || "General Service");
  
  const postedDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric' 
  }) : "Recent";

  return (
    <article className="premium-compact-card" onClick={() => onView?.(job.id)}>
      <div className="pcc-accent" style={{ backgroundColor: status.color }} />
      
      <div className="pcc-main">
        <div className="pcc-header">
          <div className="pcc-badge-group">
            <span className="pcc-status" style={{ color: status.color, backgroundColor: status.bg }}>
              {status.label}
            </span>
            <span className={`pcc-type-chip ${isPrivate ? "direct" : "public"}`}>
              {isPrivate ? "Direct" : "Public"}
            </span>
          </div>
          <div className="pcc-date-compact">
            {postedDate}
          </div>
        </div>

        <div className="pcc-body">
          <h4 className="pcc-title" title={job.title}>{job.title}</h4>
          
          <div className="pcc-meta-stack">
            <div className="pcc-meta-row">
              <RiFocus2Line className="pcc-meta-icon" />
              <span>{skillName}</span>
            </div>
            <div className="pcc-meta-row">
              <RiMapPinLine className="pcc-meta-icon" />
              <span>{job.locationName || "Remote"}</span>
            </div>
          </div>
        </div>

        <div className="pcc-footer">
          <div className="pcc-financials">
            <span className="pcc-currency">₹</span>
            <span className="pcc-amount">{job.budget}</span>
          </div>
          <div className="pcc-action-indicator">
            <RiArrowRightSLine />
          </div>
        </div>
      </div>
    </article>
  );
};

export default CompactUserJobCard;
