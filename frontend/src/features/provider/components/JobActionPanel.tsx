import React from 'react';
import {
  RiCalendarLine,
  RiMapPinLine,
  RiTimeLine,
  RiMessage3Line,
  RiHeartLine
} from 'react-icons/ri';

interface JobLocation {
  address: string;
  lat: number;
  lng: number;
  districtId: string;
  districtName?: string;
}

interface JobActionPanelProps {
  budget: string;
  duration: string;
  location: JobLocation | null;
  startDate: string;
  isApplied: boolean;
  isAssigned: boolean;
  contactNumber?: string;
  onAccept: () => void;
  onMessage: () => void;
  onSave?: () => void;
}

const JobActionPanel: React.FC<JobActionPanelProps> = ({
  budget,
  duration,
  location,
  startDate,
  isApplied,
  isAssigned,
  contactNumber,
  onAccept,
  onMessage,
}) => {
  const isDisabled = isAssigned || isApplied;

  return (
    <div
      className="card border-0 rounded-4 shadow-sm h-100 overflow-hidden"
      style={{
        backgroundColor: '#fff',
        border: '1px solid #f1f5f9',
        position: 'sticky',
        top: '2rem'
      }}
    >
      <div className="card-body p-4 d-flex flex-column gap-4">
        {/* Budget Section */}
        <div className="p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0' }}>
          <label
            className="d-block mb-1"
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'Syne, sans-serif',
              color: '#64748b'
            }}
          >
            Estimated Budget
          </label>
          <div className="d-flex align-items-center gap-2">
            <h2
              className="mb-0 fw-bold"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '32px',
                letterSpacing: '-1px',
                color: '#0f172a'
              }}
            >
              {budget}
            </h2>
          </div>
        </div>

        {/* Property Grid */}
        <div className="d-flex flex-column gap-3">
          {[
            { icon: <RiTimeLine size={20} />, label: 'Duration', value: duration, color: '#3b82f6' },
            { icon: <RiMapPinLine size={20} />, label: 'Location', value: location?.address || 'Remote', color: '#10b981' },
            { icon: <RiCalendarLine size={20} />, label: 'Start Date', value: startDate, color: '#f59e0b' },
            { icon: <RiMessage3Line size={20} />, label: 'WhatsApp / Contact', value: contactNumber || 'Not Provided', color: '#16a34a' }
          ].map((item, idx) => (
            <div key={idx} className="d-flex align-items-center gap-3 p-2 rounded-3 hover-bg">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: `${item.color}10`,
                  width: 42,
                  height: 42,
                  color: item.color,
                  border: `1px solid ${item.color}20`
                }}
              >
                {item.icon}
              </div>
              <div>
                <label className="d-block" style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</label>
                <span className="fw-bold" style={{ fontSize: '14px', color: '#334155' }}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column gap-2 mt-2">
          <button
            className={`btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm ${isDisabled ? 'disabled' : ''}`}
            onClick={onAccept}
            disabled={isDisabled}
            style={{
              background: isApplied ? '#10b981' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none',
              fontSize: '15px',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.3s ease',
              boxShadow: isApplied ? 'none' : '0 10px 20px -5px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isApplied ? 'Accepted' : isAssigned ? 'Already Assigned' : 'Accept this job'}
          </button>

          <button
            className="btn btn-outline-light w-100 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={onMessage}
            style={{
              border: '1.5px solid #e2e8f0',
              color: '#475569',
              fontSize: '15px',
              backgroundColor: '#fff'
            }}
          >
            <RiMessage3Line size={20} />
            Message Client
          </button>

          <button
            className="btn btn-link w-100 text-decoration-none fw-bold d-flex align-items-center justify-content-center gap-1"
            style={{ fontSize: '13px', color: '#94a3b8' }}
          >
            <RiHeartLine size={16} />
            Save job for later
          </button>
        </div>

        {isApplied && (
          <div
            className="alert border-0 rounded-4 mb-0 py-3 d-flex align-items-center gap-3"
            style={{
              fontSize: '13px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #dcfce7',
              fontWeight: 600
            }}
          >
            <div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div>
            You've expressed interest in this job
          </div>
        )}
      </div>

      <style>{`
        .hover-bg:hover { background-color: #f8fafc; cursor: default; }
        @media (max-width: 991px) {
          .card.border-0.rounded-4.shadow-sm.h-100 {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1050 !important;
            border-radius: 24px 24px 0 0 !important;
            box-shadow: 0 -20px 40px rgba(0,0,0,0.08) !important;
            top: auto !important;
            border: none !important;
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(16px);
          }
          .card-body.p-4 {
            padding: 1.25rem !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 16px !important;
          }
          .card-body > div:nth-child(1),
          .card-body > div:nth-child(2) {
            display: none !important;
          }
          .card-body > .mt-2 {
            margin-top: 0 !important;
            flex-direction: row !important;
            gap: 12px !important;
            flex: 1 !important;
          }
          .card-body > .mt-2 button {
            padding: 1rem !important;
            font-size: 14px !important;
          }
          .card-body > .mt-2 button:nth-child(3) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobActionPanel;
