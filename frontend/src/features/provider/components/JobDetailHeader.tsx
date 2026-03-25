import React from 'react';
import { RiMapPinLine, RiTimeLine } from 'react-icons/ri';

interface JobDetailHeaderProps {
  title: string;
  location: string;
  postedAt: string;
  isUrgent: boolean;
  isNew: boolean;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  title,
  location,
  postedAt,
  isUrgent,
  isNew,
}) => {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        {isUrgent && (
          <span 
            className="px-3 py-1 rounded-pill" 
            style={{ 
              background: 'rgba(255, 107, 107, 0.15)', 
              color: '#ff6b6b', 
              fontSize: '11px', 
              fontWeight: 700,
              border: '1px solid rgba(255, 107, 107, 0.3)',
              fontFamily: 'Syne, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Urgent
          </span>
        )}
        {isNew && (
          <span 
            className="px-3 py-1 rounded-pill" 
            style={{ 
              background: 'rgba(108, 99, 255, 0.15)', 
              color: '#a09bff', 
              fontSize: '11px', 
              fontWeight: 700,
              border: '1px solid rgba(108, 99, 255, 0.3)',
              fontFamily: 'Syne, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            New
          </span>
        )}
      </div>
      
      <h1 
        className="mb-3" 
        style={{ 
          color: 'var(--qw-text)', 
          fontSize: '32px', 
          fontWeight: 800,
          fontFamily: 'Syne, sans-serif',
          letterSpacing: '-0.8px',
          lineHeight: '1.1'
        }}
      >
        {title}
      </h1>
      
      <div className="d-flex align-items-center gap-4 flex-wrap" style={{ fontSize: '13.5px', color: 'var(--qw-muted)' }}>
        <div className="d-flex align-items-center gap-2">
          <RiMapPinLine size={16} color="var(--qw-accent)" />
          <span>{location}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <RiTimeLine size={16} color="var(--qw-accent)" />
          <span>Posted {postedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default JobDetailHeader;
