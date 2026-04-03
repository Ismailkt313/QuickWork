import React from 'react';
import { RiStarFill, RiVerifiedBadgeFill } from 'react-icons/ri';

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
    <div className="jic-root card border-0 rounded-4 shadow-sm mb-4 overflow-hidden" style={{ backgroundColor: '#fff', border: '1px solid #f1f5f9' }}>
      <div className="card-body p-4 p-lg-5">
        {/* Client Profile Bar */}
        <div className="jic-client-bar d-flex align-items-center gap-3 mb-5 p-4 rounded-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div className="jic-avatar position-relative">
            {client.avatarUrl ? (
              <img src={client.avatarUrl} alt={client.name} className="rounded-circle shadow-sm" style={{ width: 64, height: 64, objectFit: 'cover', border: '3px solid #fff' }} />
            ) : (
              <div className="rounded-circle shadow-sm d-flex align-items-center justify-content-center fw-bold text-white bg-primary" style={{ width: 64, height: 64, fontSize: '20px', border: '3px solid #fff' }}>
                {client.initials}
              </div>
            )}
            {client.isVerified && (
              <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-0" style={{ transform: 'translate(20%, 20%)', color: '#3b82f6' }}>
                <RiVerifiedBadgeFill size={24} />
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <h5 className="mb-1 fw-bold" style={{ color: '#0f172a', fontFamily: 'Syne, sans-serif', fontSize: '18px' }}>{client.name}</h5>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center text-primary" style={{ fontSize: '14px', fontWeight: 700 }}>
                <RiStarFill className="text-warning me-1" size={16} />
                <span>{client.rating || '5.0'}</span>
              </div>
              <div className="text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                {client.reviewsCount || 0} Professional Reviews
              </div>
            </div>
          </div>
          <div className="d-none d-md-block">
            <button className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold" style={{ fontSize: '12px' }}>View Profile</button>
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-5">
          <h4 className="mb-4 fw-bold" style={{ color: '#0f172a', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>About the position</h4>
          <div className="jic-description text-secondary" style={{ lineHeight: '1.8', fontSize: '16px', whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif' }}>
            {description}
          </div>
        </div>

        {/* Skills Tag Section */}
        <div>
          <h4 className="mb-4 fw-bold" style={{ color: '#0f172a', fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>Expertise wanted</h4>
          <div className="d-flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-2 rounded-3" style={{ background: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: 700, border: '1px solid #e2e8f0', letterSpacing: '0.2px' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .jic-description { color: #475569 !important; }
        @media (max-width: 576px) {
          .jic-client-bar { padding: 1.5rem !important; }
          .jic-avatar { transform: scale(0.85); margin-left: -5px; }
        }
      `}</style>
    </div>
  );
};

export default JobInfoCard;
