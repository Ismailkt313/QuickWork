import React from 'react';
import { 
  RiCalendarLine, 
  RiMapPinLine, 
  RiUser3Line,
  RiTimeLine,
  RiMapPinRangeLine,
  RiArrowRightLine
} from 'react-icons/ri';

interface MyJobCardProps {
  assignment: {
    id: string;
    job: {
      id: string;
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
    } | null;
    workStatus: 'assigned' | 'in_progress' | 'completed';
    schedule: {
      startDate: string;
      endDate: string;
    };
    assignedAt: string;
    isOutOfDistrict: boolean;
    type: 'open' | 'direct';
  };
  onViewDetails?: (id: string) => void;
}

const MyJobCard: React.FC<MyJobCardProps> = ({ assignment, onViewDetails }) => {
  const { job, workStatus, schedule, isOutOfDistrict, type } = assignment;

  if (!job) return null;

  const getStatusColor = () => {
    switch (workStatus) {
      case 'assigned': return { bg: '#eff6ff', text: '#3b82f6', border: '#dbeafe' };
      case 'in_progress': return { bg: '#fff7ed', text: '#f97316', border: '#ffedd5' };
      case 'completed': return { bg: '#f0fdf4', text: '#22c55e', border: '#dcfce7' };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' };
    }
  };

  const statusStyle = getStatusColor();

  return (
    <div 
      className="bg-white rounded-4 border p-4 mb-4 shadow-sm hover-shadow-md transition-all position-relative overflow-hidden"
      style={{ border: '1px solid #f1f5f9' }}
    >
      {/* Decorative Status Bar */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '6px', 
          height: '100%', 
          backgroundColor: statusStyle.text 
        }} 
      />

      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span 
              className="px-2 py-1 rounded-2 fw-bold" 
              style={{ 
                fontSize: '10px', 
                backgroundColor: statusStyle.bg, 
                color: statusStyle.text,
                border: `1px solid ${statusStyle.border}`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {workStatus.replace('_', ' ')}
            </span>
            {type === 'direct' && (
              <span 
                className="px-2 py-1 rounded-2 fw-bold" 
                style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#faf5ff', 
                  color: '#a855f7',
                  border: '1px solid #f3e8ff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Direct Hire
              </span>
            )}
            {isOutOfDistrict && (
              <span 
                className="px-2 py-1 rounded-2 fw-bold" 
                style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#fffbeb', 
                  color: '#d97706',
                  border: '1px solid #fef3c7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <RiMapPinRangeLine className="me-1" />
                Waitlisted Zone
              </span>
            )}
          </div>
          <h3 className="fw-bold mb-1" style={{ color: '#0f172a', fontSize: '1.25rem', fontFamily: 'Syne, sans-serif' }}>
            {job.title}
          </h3>
          <div className="d-flex align-items-center text-muted gap-3 mt-2" style={{ fontSize: '13px' }}>
            <span className="d-flex align-items-center gap-1">
              <RiUser3Line /> {job.clientName}
            </span>
            <span className="d-flex align-items-center gap-1">
              <RiMapPinLine /> {job.location?.address || 'Remote'}
            </span>
          </div>
        </div>
        <div className="text-end">
          <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{job.budget}</div>
          <div className="text-muted" style={{ fontSize: '11px' }}>Est. Total</div>
        </div>
      </div>

      <div className="row g-3 mt-2 mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc' }}>
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 bg-white rounded-2 border">
              <RiCalendarLine className="text-primary" />
            </div>
            <div>
              <div className="text-muted fw-semibold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Schedule</div>
              <div className="text-dark fw-bold" style={{ fontSize: '13px' }}>
                {new Date(schedule.startDate).toLocaleDateString()} - {new Date(schedule.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex align-items-center gap-2 text-end justify-content-md-end">
            <div>
              <div className="text-muted fw-semibold" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Time Range</div>
              <div className="text-dark fw-bold" style={{ fontSize: '13px' }}>
                {new Date(schedule.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div className="p-2 bg-white rounded-2 border">
              <RiTimeLine className="text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex gap-2 w-100">
          <button 
            className="btn btn-primary rounded-pill px-4 py-2 w-100 shadow-sm fw-bold d-flex align-items-center justify-content-center gap-2 transition-all hover-translate-x" 
            onClick={() => onViewDetails?.(assignment.id)}
            style={{ fontSize: '14px' }}
          >
            Manage Assignment <RiArrowRightLine />
          </button>
        </div>
      </div>

      <style>{`
        .hover-shadow-md:hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default MyJobCard;
