import React from 'react';
import { 
  RiMapPinLine, 
  RiTimeLine, 
  RiCalendarEventLine,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';
import type { JobDetail } from '../types/job';

interface RequestCardProps {
  request: JobDetail;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isActionLoading?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  onAccept, 
  onReject,
  isActionLoading 
}) => {
  const isPending = request.status === 'open';
  const isAccepted = request.status === 'assigned';
  const isRejected = request.status === 'cancelled' || request.status === 'rejected';

  return (
    <div 
      className={`card border-0 rounded-4 shadow-sm mb-4 overflow-hidden transition-all duration-300 ${isPending ? 'border-start border-4 border-primary' : ''}`}
      style={{ 
        backgroundColor: '#fff',
        opacity: isPending ? 1 : 0.7,
        transform: 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="card-body p-4">
         <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Direct Request
              </span>
              {isAccepted && (
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Accepted
                </span>
              )}
              {isRejected && (
                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3 py-1" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Rejected
                </span>
              )}
            </div>
            <h5 className="mb-1 fw-bold" style={{ color: '#0f172a', fontSize: '18px', fontFamily: 'Syne, sans-serif' }}>{request.title}</h5>
            <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
              <div className="qw-avatar-xs" style={{ width: 22, height: 22, fontSize: '10px', borderRadius: 6, backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {request.clientInitials}
              </div>
              <span>From <strong>{request.clientName}</strong></span>
            </div>
          </div>
          <div className="text-end">
            <div className="fw-bold text-primary" style={{ fontSize: '18px' }}>{request.budget}</div>
            <div className="text-muted" style={{ fontSize: '11px', fontWeight: 600 }}>ESTIMATED BUDGET</div>
          </div>
        </div>

         <p className="mb-4 text-secondary" style={{ fontSize: '14.5px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {request.description}
        </p>

         <div className="row g-3 mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <RiMapPinLine className="text-muted" size={16} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Location</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{request.location}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <RiCalendarEventLine className="text-muted" size={16} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Schedule</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{request.startDate}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <RiTimeLine className="text-muted" size={16} />
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Duration</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{request.durationType.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="d-flex gap-3 mt-2">
            <button 
              disabled={isActionLoading}
              onClick={() => onAccept(request.id)}
              className="btn btn-primary flex-fill py-2-5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
            >
              <RiCheckLine size={18} /> Accept Request
            </button>
            <button 
              disabled={isActionLoading}
              onClick={() => onReject(request.id)}
              className="btn btn-outline-danger flex-fill py-2-5 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              style={{ border: '1.5px solid #fee2e2', backgroundColor: 'transparent' }}
            >
              <RiCloseLine size={18} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
