import React from 'react';
import { 
  RiMapPinLine, 
  RiCalendarLine, 
  RiMoneyDollarCircleLine, 
  RiMore2Fill,
  RiEyeLine,
  RiCloseCircleLine,
  RiFocus2Line,
  RiLockLine,
  RiGlobeLine
} from 'react-icons/ri';

interface UserJobCardProps {
  job: any;
  onCancel?: (id: string) => void;
  onView?: (id: string) => void;
}

const UserJobCard: React.FC<UserJobCardProps> = ({ job, onCancel, onView }) => {
  const isPrivate = job.visibility === 'private';
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'Pending', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' };
      case 'partially_assigned':
        return { label: 'Partially Assigned', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'fully_assigned':
      case 'in_progress':
        return { label: 'Ongoing', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' };
      case 'completed':
        return { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { label: status, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const status = getStatusConfig(job.status);
  const skillName = job.skills && job.skills[0] ? job.skills[0] : 'General Service';

  return (
    <div className="qw-job-card" onClick={() => onView?.(job.id)}>
      {/* Decorative Top Line */}
      <div className="qw-card-accent" style={{ background: status.color }} />

      <div className="p-4">
        {/* Header: Badges & Actions */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex flex-wrap gap-2">
             <div className="qw-status-badge" style={{ color: status.color, backgroundColor: status.bg }}>
               <span className="qw-dot" style={{ backgroundColor: status.color }} />
               {status.label}
            </div>
            {isPrivate ? (
               <div className="qw-visibility-badge private">
                <RiLockLine size={12} /> Direct Hire
              </div>
            ) : (
                <div className="qw-visibility-badge public">
                <RiGlobeLine size={12} /> Public
              </div>
            )}
          </div>
          
          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
            <button className="qw-more-btn" data-bs-toggle="dropdown">
              <RiMore2Fill size={20} />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2">
              <li>
                <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-3" onClick={() => onView?.(job.id)}>
                  <RiEyeLine size={18} /> View Details
                </button>
              </li>
              {(job.status === 'open' || job.status === 'partially_assigned' || job.status === 'fully_assigned' || job.status === 'in_progress') && (
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-danger" onClick={() => onCancel?.(job.id)}>
                    <RiCloseCircleLine size={18} /> Cancel Job
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Job Title & Category */}
        <div className="mb-4">
          <h5 className="qw-job-title mb-2">{job.title}</h5>
          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px', fontWeight: 500 }}>
            <RiFocus2Line className="text-primary" size={16} /> 
            {skillName}
          </div>
        </div>
        
        {/* Quick Info Grid */}
        <div className="qw-info-grid mb-4">
          <div className="qw-info-item">
            <RiMapPinLine className="qw-info-icon" />
            <span>{job.location?.address || 'Remote'}</span>
          </div>
          <div className="qw-info-item">
            <RiCalendarLine className="qw-info-icon" />
            <span>{job.startDate || 'TBD'}</span>
          </div>
        </div>

        {/* Footer: Budget & Action */}
        <div className="qw-card-footer pt-3 d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column">
            <span className="qw-footer-label">Budget</span>
            <div className="d-flex align-items-center gap-1 fw-bold text-dark fs-5">
              <RiMoneyDollarCircleLine size={20} className="text-success" />
              {job.budget}
            </div>
          </div>
          
          {['completed', 'cancelled', 'rejected'].includes(job.status) ? (
            <div className="qw-manage-btn" style={{ opacity: 0.6, cursor: 'default', background: '#f8fafc', color: '#94a3b8' }}>
              {job.status === 'completed' ? 'Completed' : 'Cancelled'}
            </div>
          ) : (
            <button 
              className="qw-cancel-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.(job.id);
              }}
            >
              Cancel Job
            </button>
          )}
        </div>
      </div>

      <style>{`
        .qw-job-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.02);
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .qw-job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.12);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .qw-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          opacity: 0.6;
        }

        .qw-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .qw-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .qw-visibility-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .qw-visibility-badge.private { background: #0f172a; color: white; }
        .qw-visibility-badge.public { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        .qw-more-btn {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          transition: all 0.2s;
        }

        .qw-more-btn:hover { background: #f1f5f9; color: #0f172a; }

        .qw-job-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .qw-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .qw-info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          background: #f8fafc;
          padding: 8px 12px;
          border-radius: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .qw-info-icon { color: #94a3b8; flex-shrink: 0; }

        .qw-card-footer {
          border-top: 1px dashed #e2e8f0;
        }

        .qw-footer-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .qw-manage-btn {
          background: #f1f5f9;
          color: #0f172a;
          border: none;
          padding: 10px 18px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .qw-manage-btn:hover {
          background: #0f172a;
          color: white;
        }

        .qw-cancel-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 10px 18px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .qw-cancel-btn:hover {
          background: #ef4444;
          color: white;
        }

        @media (max-width: 576px) {
          .qw-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default UserJobCard;
