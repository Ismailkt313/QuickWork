import React, { useState } from "react";
import {
  RiMapPinLine,
  RiTimeLine,
  RiCalendarLine,
  RiUserLine,
  RiGroupLine,
  RiMoneyDollarCircleLine,
  RiBookmarkLine,
  RiBookmarkFill,
  RiCheckDoubleLine,
  RiAlertLine,
  RiMedalLine,
  RiSparklingLine,
  RiBriefcaseLine,
  RiExternalLinkLine
} from "react-icons/ri";
import "./style/jobcard.css";
import { useProviderLocation } from "../hooks/useProviderLocation";

export interface JobLocation {
  address: string;
  lat: number;
  lng: number;
  districtId: string;
  districtName?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientAvatarUrl?: string;
  clientInitials?: string;
  clientAvatarColor?: string;
  clientRating?: number;
  clientReviewsCount?: number;
  location: JobLocation | null;
  postedAt: string;
  skills: string[];
  budget: string;
  budgetRange: {
    min: number;
    max: number;
  };
  applicants: number;
  startDate: string;
  endDate: string;
  durationType: string;
  freelancersNeeded?: number;
  visibility: "public" | "private";
  hiredProviderId?: string;
  isUrgent?: boolean;
  isRecommended?: boolean;
  isNew?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  animationDelay?: number;
  jobCode: string;
}

interface JobCardProps {
  job: Job;
  onApply?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onSave?: (id: string, saved: boolean) => void;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#06b6d4,#0ea5e9)",
  "linear-gradient(135deg,#f97316,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#22c55e,#16a34a)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
];
const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const DURATION_LABEL: Record<string, string> = {
  half_day: "Half Day (~4 hrs)",
  full_day: "Full Day (8 hrs)",
  multi_day: "Multiple Days",
};

const StarRating: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <span key={s} style={{ fontSize: 11, color: s <= Math.round(rating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
    ))}
    <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginLeft: 2 }}>{rating.toFixed(1)}</span>
    {count !== undefined && <span style={{ fontSize: 10, color: "#94a3b8" }}>({count})</span>}
  </span>
);

const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewDetails, onSave }) => {
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const [applied, setApplied] = useState(job.isApplied ?? false);
  const providerLocation = useProviderLocation();

  React.useEffect(() => { setApplied(job.isApplied ?? false); }, [job.isApplied]);

  const handleSave = () => { const n = !saved; setSaved(n); onSave?.(job.id, n); };
  const handleApply = () => { if (applied) return; setApplied(true); onApply?.(job.id); };

  const avatarBg = job.clientAvatarColor ?? getAvatarColor(job.clientName);
  const visibleSkills = job.skills.slice(0, 5);
  const extraSkills = job.skills.length - visibleSkills.length;

  const jobDistrict = job.location?.districtName?.toLowerCase().trim() ?? "";
  const myDistrict = providerLocation?.toLowerCase().trim() ?? "";
  const isMyArea = myDistrict && myDistrict !== "not set" && jobDistrict
    ? jobDistrict.includes(myDistrict) || myDistrict.includes(jobDistrict)
    : null;

  const isMultiDay = job.startDate !== job.endDate;

  return (
    <article
      className={`jc-card${saved ? " saved" : ""}`}
      style={job.animationDelay ? { animationDelay: `${job.animationDelay}ms` } : undefined}
      aria-label={`Job: ${job.title}`}
    >
      {}
      <div className="jc-status-stripe" style={{ background: job.isUrgent ? "#ef4444" : "#6366f1" }} />

      {}
      <div className="jc-badges-row">
        {job.isUrgent && (
          <span className="jc-badge jc-badge-urgent">
            <span className="jc-badge-pulse" /> Urgent
          </span>
        )}
        {job.isRecommended && (
          <span className="jc-badge jc-badge-recommended">
            <RiMedalLine size={10} /> Best Match
          </span>
        )}
        {job.isNew && !job.isUrgent && !job.isRecommended && (
          <span className="jc-badge jc-badge-new">
            <RiSparklingLine size={10} /> New
          </span>
        )}
        {}
        {isMyArea === true && (
          <span className="jc-badge jc-badge-area-success">
            <RiMapPinLine size={10} /> Your Area
          </span>
        )}
        {isMyArea === false && (
          <span className="jc-badge jc-badge-area-warning">
            <RiAlertLine size={10} /> Not Your Area
          </span>
        )}
      </div>

      {}
      <div className="jc-client-row">
        <div className="jc-avatar" style={{ background: avatarBg }}>
          {job.clientAvatarUrl
            ? <img src={job.clientAvatarUrl} alt={job.clientName} />
            : (job.clientInitials ?? job.clientName.slice(0, 2).toUpperCase())}
        </div>
        <div className="jc-client-info">
          <h3 className="jc-job-title" title={job.title}>{job.title}</h3>
          <div className="jc-client-meta">
            <span className="jc-client-name"><RiUserLine size={11} /> {job.clientName}</span>
            <span className="jc-meta-sep">·</span>
            <span className="jc-job-code">{job.jobCode}</span>
            {job.clientRating !== undefined && (
              <><span className="jc-meta-sep">·</span><StarRating rating={job.clientRating} count={job.clientReviewsCount} /></>
            )}
            <span className="jc-meta-sep">·</span>
            <span className="jc-posted"><RiTimeLine size={11} /> {job.postedAt}</span>
          </div>
        </div>
      </div>

      {}
      <p className="jc-description">{job.description}</p>

      {}
      <div className="jc-detail-grid">
        {}
        <div className="jc-detail-cell">
          <div className={`jc-detail-icon ${isMyArea === false ? 'warning' : 'success'}`}>
            <RiMapPinLine size={14} />
          </div>
          <div className="jc-detail-body">
            <div className="jc-detail-label">Location</div>
            <div className="jc-detail-val" title={job.location?.address}>
              {job.location?.address || "Not specified"}
              {isMyArea === false && <span className="jc-area-hint warning">⚠ Outside your area</span>}
              {isMyArea === true && <span className="jc-area-hint success">✓ Your district</span>}
            </div>
          </div>
        </div>

        {}
        <div className="jc-detail-cell">
          <div className="jc-detail-icon schedule">
            <RiCalendarLine size={14} />
          </div>
          <div className="jc-detail-body">
            <div className="jc-detail-label">{isMultiDay ? "Schedule" : "Date"}</div>
            <div className="jc-detail-val">
              {isMultiDay ? `${job.startDate} → ${job.endDate}` : job.startDate}
            </div>
          </div>
        </div>

        {}
        <div className="jc-detail-cell">
          <div className="jc-detail-icon duration">
            <RiTimeLine size={14} />
          </div>
          <div className="jc-detail-body">
            <div className="jc-detail-label">Duration</div>
            <div className="jc-detail-val">{DURATION_LABEL[job.durationType] ?? job.durationType.replace(/_/g, " ")}</div>
          </div>
        </div>

        {}
        {job.freelancersNeeded !== undefined && (
          <div className="jc-detail-cell">
            <div className="jc-detail-icon providers">
              <RiGroupLine size={14} />
            </div>
            <div className="jc-detail-body">
              <div className="jc-detail-label">Providers Needed</div>
              <div className="jc-detail-val">{job.freelancersNeeded} provider{job.freelancersNeeded > 1 ? "s" : ""}</div>
            </div>
          </div>
        )}
      </div>

      {}
      {job.skills.length > 0 && (
        <div className="jc-skills">
          {visibleSkills.map(skill => (
            <span key={skill} className="jc-skill-tag">{skill}</span>
          ))}
          {extraSkills > 0 && <span className="jc-skill-more">+{extraSkills} more</span>}
        </div>
      )}

      {}
      <div className="jc-info-row">
        <div className="jc-info-item">
          <div className="jc-info-label"><RiMoneyDollarCircleLine size={11} /> Budget / Provider</div>
          <div className="jc-info-val budget">{job.budget}</div>
        </div>
        <div className="jc-info-item" style={{ textAlign: "right" }}>
          <div className="jc-info-label"><RiGroupLine size={11} /> Applicants</div>
          <div className="jc-info-val applicants-count">{job.applicants}</div>
        </div>
      </div>


      {}
      <div className="jc-actions">
        <button
          className={`jc-save-btn${saved ? " saved" : ""}`}
          onClick={handleSave}
          aria-label={saved ? "Unsave job" : "Save job"}
          title={saved ? "Saved" : "Save for later"}
        >
          {saved ? <RiBookmarkFill size={16} /> : <RiBookmarkLine size={16} />}
        </button>

        <button
          className="jc-view-btn"
          onClick={() => onViewDetails?.(job.id)}
        >
          <RiExternalLinkLine size={14} /> View Details
        </button>

        <button
          className={`jc-apply-btn${applied ? " applied" : ""}`}
          onClick={handleApply}
          disabled={applied}
        >
          {applied
            ? <><RiCheckDoubleLine size={15} /> Applied</>
            : <><RiBriefcaseLine size={14} /> Quick Apply</>
          }
        </button>
      </div>
    </article>
  );
};

export default JobCard;
