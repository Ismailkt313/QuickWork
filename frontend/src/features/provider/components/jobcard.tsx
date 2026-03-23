// JobCard.tsx — QuickWork Reusable Job Card
import React, { useState } from 'react';
import './style/jobcard.css';

// ─── Types ────────────────────────────────────────────────────
export interface Job {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientAvatarUrl?: string;
  clientInitials?: string;
  clientAvatarColor?: string;
  clientRating?: number;
  clientReviewCount?: number;
  location: string;
  postedAt: string; 
  skills: string[];
  budget: string; 
  jobType: 'Hourly' | 'Fixed';
  applicants: number;
  isUrgent?: boolean;
  isRecommended?: boolean;
  isNew?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  animationDelay?: number;   // ms, for staggered entry
}

interface JobCardProps {
  job: Job;
  onApply?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onSave?: (id: string, saved: boolean) => void;
}

// ─── Star Rating Helper ───────────────────────────────────────
const StarRating: React.FC<{ rating: number; count?: number }> = ({ rating, count }) => (
  <div className="jc-stars" aria-label={`Rating: ${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`jc-star ${s <= Math.round(rating) ? 'filled' : 'empty'}`}>★</span>
    ))}
    <span className="jc-rating-num">{rating.toFixed(1)}</span>
    {count !== undefined && <span className="jc-rating-count">({count})</span>}
  </div>
);

// ─── Avatar Color Pool ────────────────────────────────────────
const AVATAR_COLORS = [
  'linear-gradient(135deg,#6c63ff,#9c55f5)',
  'linear-gradient(135deg,#00d9b8,#0ea5e9)',
  'linear-gradient(135deg,#f97316,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#22c55e,#16a34a)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
];

const getAvatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── SVG Icons ────────────────────────────────────────────────
const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconUsers = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconWallet = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
  </svg>
);
const IconBookmark = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? '#ffd166' : 'none'}
    stroke={filled ? '#ffd166' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconSend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// ─── JobCard Component ────────────────────────────────────────
const JobCard: React.FC<JobCardProps> = ({ job, onApply, onViewDetails, onSave }) => {
  const [saved, setSaved]     = useState(job.isSaved ?? false);
  const [applied, setApplied] = useState(job.isApplied ?? false);

  const handleSave = () => {
    const next = !saved;
    setSaved(next);
    onSave?.(job.id, next);
  };

  const handleApply = () => {
    if (applied) return;
    setApplied(true);
    onApply?.(job.id);
  };

  const visibleSkills = job.skills.slice(0, 4);
  const extraSkills   = job.skills.length - visibleSkills.length;

  const avatarBg = job.clientAvatarColor ?? getAvatarColor(job.clientName);

  return (
    <article
      className={`jc-card${saved ? ' saved' : ''}`}
      style={job.animationDelay ? { animationDelay: `${job.animationDelay}ms` } : undefined}
      aria-label={`Job: ${job.title}`}
    >
      {(job.isUrgent || job.isRecommended || job.isNew) && (
        <div className="jc-badges-row" aria-hidden="true">
          {job.isUrgent && (
            <span className="jc-badge jc-badge-urgent">
              <span className="jc-badge-pulse" /> Urgent
            </span>
          )}
          {job.isRecommended && (
            <span className="jc-badge jc-badge-recommended">✦ Match</span>
          )}
          {job.isNew && !job.isUrgent && !job.isRecommended && (
            <span className="jc-badge jc-badge-new">New</span>
          )}
        </div>
      )}

      <div className="jc-client-row">
        <div
          className="jc-avatar"
          style={{ background: avatarBg }}
          aria-hidden="true"
        >
          {job.clientAvatarUrl
            ? <img src={job.clientAvatarUrl} alt={job.clientName} />
            : (job.clientInitials ?? job.clientName.slice(0, 2).toUpperCase())
          }
        </div>
        <div className="jc-client-info">
          <h3 className="jc-job-title" title={job.title}>{job.title}</h3>
          <div className="jc-client-meta">
            <span className="jc-client-name">{job.clientName}</span>
            {job.clientRating !== undefined && (
              <>
                <span className="jc-meta-sep">•</span>
                <StarRating rating={job.clientRating} count={job.clientReviewCount} />
              </>
            )}
            <span className="jc-meta-sep">•</span>
            <span className="jc-location">
              <IconPin /> {job.location}
            </span>
            <span className="jc-meta-sep">•</span>
            <span className="jc-posted">
              <IconClock /> {job.postedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="jc-description">{job.description}</p>

      {/* Skills */}
      <div className="jc-skills" aria-label="Required skills">
        {visibleSkills.map((skill) => (
          <span key={skill} className="jc-skill-tag">{skill}</span>
        ))}
        {extraSkills > 0 && (
          <span className="jc-skill-more">+{extraSkills} more</span>
        )}
      </div>

      {/* Info row: budget · applicants · type */}
      <div className="jc-info-row">
        <div className="jc-info-item">
          <span className="jc-info-icon"><IconWallet /></span>
          <span className="jc-info-label">Budget:</span>
          <span className="jc-info-val budget">{job.budget}</span>
        </div>
        <div className="jc-info-item">
          <span className="jc-info-icon"><IconUsers /></span>
          <span className="jc-info-val">{job.applicants}</span>
          <span className="jc-info-label">applicants</span>
        </div>
        <span className={`jc-type-pill ${job.jobType === 'Hourly' ? 'jc-type-hourly' : 'jc-type-fixed'}`}>
          {job.jobType}
        </span>
      </div>

      {/* Actions */}
      <div className="jc-actions">
        <button
          className={`jc-save-btn${saved ? ' saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Unsave job' : 'Save job'}
          title={saved ? 'Saved' : 'Save for later'}
        >
          <IconBookmark filled={saved} />
        </button>

        <button
          className="jc-view-btn"
          onClick={() => onViewDetails?.(job.id)}
          aria-label={`View details for ${job.title}`}
        >
          View Details
        </button>

        <button
          className={`jc-apply-btn${applied ? ' applied' : ''}`}
          onClick={handleApply}
          disabled={applied}
          aria-label={applied ? 'Already applied' : `Apply to ${job.title}`}
        >
          {applied ? (
            <><IconCheck /> Applied</>
          ) : (
            <><IconSend /> Apply Now</>
          )}
        </button>
      </div>
    </article>
  );
};

export default JobCard;