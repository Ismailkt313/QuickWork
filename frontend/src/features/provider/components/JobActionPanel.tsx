import React from 'react';
import { RiCalendarLine, RiMapPinLine, RiTimeLine } from 'react-icons/ri';

interface JobActionPanelProps {
  budget: string;
  duration: string;
  location: string;
  startDate: string;
  isApplied: boolean;
  isAssigned: boolean;
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
  onAccept,
  onMessage,
}) => {
  const isDisabled = isAssigned || isApplied;

  return (
    <div
      className="card border-0 rounded-4 shadow-lg h-100"
      style={{
        backgroundColor: 'var(--qw-bg, #2b2d2f)',
        border: '1px solid var(--qw-border, rgba(255,255,255,0.07))',
        position: 'sticky',
        top: '2rem'
      }}
    >
      <div className="card-body p-4 d-flex flex-column gap-4">
        <div>
          <label
            className="d-block mb-1"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontFamily: 'Syne, sans-serif',
              color: 'var(--qw-muted)'
            }}
          >
            Job Budget
          </label>
          <div className="d-flex align-items-center gap-2">
            <h2
              className="mb-0 fw-bold text-black"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '28px',
                letterSpacing: '-0.5px',
              }}
            >
              {budget}
            </h2>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-2-5 rounded-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: 'rgba(108, 99, 255, 0.1)',
                border: '1px solid rgba(108, 99, 255, 0.15)',
                width: 40,
                height: 40
              }}
            >
              <RiTimeLine size={20} style={{ color: '#a09bff' }} />
            </div>
            <div>
              <label className="d-block" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--qw-muted)' }}>Duration</label>
              <span className="fw-semibold text-black" style={{ fontSize: '13.5px', fontFamily: 'DM Sans, sans-serif' }}>{duration}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div
              className="p-2-5 rounded-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: 'rgba(108, 99, 255, 0.1)',
                border: '1px solid rgba(108, 99, 255, 0.15)',
                width: 40,
                height: 40
              }}
            >

              
              <RiMapPinLine size={20} style={{ color: '#a09bff' }} />
            </div>
            <div>
              <label className="d-block" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--qw-muted)' }}>Location</label>
              <span className="fw-semibold " style={{ fontSize: '13.5px', fontFamily: 'DM Sans, sans-serif',color:'black' }}>{location}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div
              className="p-2-5 rounded-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: 'rgba(108, 99, 255, 0.1)',
                border: '1px solid rgba(108, 99, 255, 0.15)',
                width: 40,
                height: 40
              }}
            >
              <RiCalendarLine size={20} style={{ color: '#a09bff' }} />
            </div>
            <div>
              <label className="d-block" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--qw-muted)' }}>Start Date</label>
              <span className="fw-semibold text-black" style={{ fontSize: '13.5px', fontFamily: 'DM Sans, sans-serif' }}>{startDate}</span>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-2 mt-2">
          <button
            className={`btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm ${isDisabled ? 'disabled' : ''}`}
            onClick={onAccept}
            disabled={isDisabled}
            style={{
              backgroundColor: isApplied ? '#00d9b8' : 'var(--qw-accent, #6c63ff)',
              border: 'none',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.25)'
            }}
          >
            {isApplied ? 'Already Applied' : isAssigned ? 'Job Assigned' : 'Accept Job'}
          </button>

          <button
            className="btn btn-outline-secondary w-100 py-3 rounded-3 fw-bold"
            onClick={onMessage}
            style={{
              border: '1px solid var(--qw-border, rgba(255,255,255,0.1))',
              color: 'var(--qw-text, #e8eaf0)',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              backgroundColor: 'rgba(255,255,255,0.03)'
            }}
          >
            Message Client
          </button>

          <button
            className="btn btn-link w-100 text-decoration-none fw-semibold"
            style={{ fontSize: '12px', fontFamily: 'DM Sans, sans-serif', color: 'var(--qw-muted)' }}
          >
            Save for Later
          </button>
        </div>

        {isApplied && (
          <div
            className="alert border-0 rounded-4 mb-0 py-2-5 d-flex align-items-center gap-2"
            style={{
              fontSize: '12.5px',
              backgroundColor: 'rgba(0, 217, 184, 0.1)',
              color: '#00d9b8',
              fontFamily: 'DM Sans, sans-serif'
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#00d9b8' }}></div>
            Interest sent successfully
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 991px) {
          .action-panel-container { height: auto !important; }
          .card.border-0.rounded-4.shadow-lg.h-100 {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1050 !important;
            border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.3) !important;
            top: auto !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            background: rgba(43, 45, 47, 0.95) !important;
            backdrop-filter: blur(10px);
          }
          .card-body.p-4 {
            padding: 1rem !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 12px !important;
          }
          .card-body > div:first-child,
          .card-body > div:nth-child(2),
          .card-body > div:last-child {
            display: none !important;
          }
          .card-body > .mt-2 {
            margin-top: 0 !important;
            flex-direction: row !important;
            gap: 8px !important;
            flex: 1 !important;
          }
          .card-body > .mt-2 button {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
            font-size: 13px !important;
          }
          .card-body > .mt-2 button:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JobActionPanel;
