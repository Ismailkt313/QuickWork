import React from 'react';
import { RiShieldCheckFill, RiStarFill } from 'react-icons/ri';

interface JobInfoCardProps {
  description: string;
  client: {
    name: string;
    initials: string;
    rating?: number;
    reviewsCount?: number;
    isVerified?: boolean;
    avatarUrl?: string;
  };
  skills: string[];
}

const JobInfoCard: React.FC<JobInfoCardProps> = ({ description, client, skills }) => {
  return (
    <div
      className="card border-0 rounded-4 shadow-sm mb-4"
      style={{
        backgroundColor: 'var(--qw-bg, #2b2d2f)',
        border: '1px solid var(--qw-border, rgba(255,255,255,0.07))'
      }}
    >
      <div className="card-body p-4">
         <div
          className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4"
          style={{
            backgroundColor: 'var(--qw-surface, #323436)',
            border: '1px solid var(--qw-border, rgba(255,255,255,0.07))'
          }}
        >
          <div className="qw-avatar" style={{ width: 44, height: 44, fontSize: '14px', fontWeight: 600 }}>
            {client.avatarUrl ? (
              <img src={client.avatarUrl} alt={client.name} className="rounded-3 w-100 h-100 object-fit-cover" />
            ) : (
              client.initials
            )}
          </div>
          <div className="flex-1">
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0 fw-bold" style={{ color: 'var(--qw-text)', fontFamily: 'Syne, sans-serif', fontSize: '15px' }}>{client.name}</h6>
              {client.isVerified && <RiShieldCheckFill className="text-primary" size={15} />}
            </div>
            <div className="d-flex align-items-center gap-2 mt-1">
              <div className="d-flex align-items-center text-warning" style={{ fontSize: '12px' }}>
                <RiStarFill size={12} />
                <span className="ms-1 fw-bold">{client.rating || 'N/A'}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--qw-muted)' }}>({client.reviewsCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h5
            className="mb-3"
            style={{
              color: 'var(--qw-text)',
              fontFamily: 'Syne, sans-serif',
              fontSize: '18px',
              fontWeight: 700
            }}
          >
            Job Description
          </h5>
          <div
            style={{
              lineHeight: '1.7',
              fontSize: '14.5px',
              fontFamily: 'DM Sans, sans-serif',
              whiteSpace: 'pre-wrap',
              color: 'rgba(69, 79, 87, 0.9)'
            }}
          >
            {description}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h5
            className="mb-3"
            style={{
              color: 'var(--qw-text)',
              fontFamily: 'Syne, sans-serif',
              fontSize: '18px',
              fontWeight: 700
            }}
          >
            Skills Required
          </h5>
          <div className="d-flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1-5 rounded-3"
                style={{
                  backgroundColor: 'rgba(108, 99, 255, 0.08)',
                  border: '1px solid rgba(108, 99, 255, 0.15)',
                  color: '#a09bff',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'DM Sans, sans-serif'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobInfoCard;
