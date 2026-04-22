import React from "react";
import {
  RiFlashlightLine,
  RiTimeLine,
  RiMapPinLine,
  RiShieldCheckLine,
} from "react-icons/ri";

interface JobLocation {
  address: string;
  lat: number;
  lng: number;
  districtId: string;
  districtName?: string;
}

interface JobDetailHeaderProps {
  title: string;
  isUrgent?: boolean;
  isNew?: boolean;
  postedAt: string;
  location: JobLocation | null;
  additionalDetails?: string;
}

const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
  title,
  isUrgent,
  isNew,
  postedAt,
  location,
  additionalDetails,
}) => {
  return (
    <div className="jdh-root mb-4 pb-2">
      <div className="d-flex align-items-center gap-2 mb-3">
        {isUrgent && (
          <span className="jdh-badge badge-urgent">
            <RiFlashlightLine size={14} className="me-1" />
            URGENT HIRE
          </span>
        )}
        {isNew && <span className="jdh-badge badge-new">NEW POST</span>}
        <span className="jdh-badge badge-verified">
          <RiShieldCheckLine size={14} className="me-1" />
          VERIFIED JOB
        </span>
      </div>

      <h1 className="jdh-title mb-3">{title}</h1>

      <div className="d-flex align-items-center gap-4 text-muted jdh-meta">
        <div className="d-flex align-items-center gap-2">
          <RiTimeLine size={18} className="text-primary-emphasis" />
          <span>
            Posted <strong>{postedAt}</strong>
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <RiMapPinLine size={18} className="text-primary-emphasis" />
          <div className="d-flex flex-column">
            <span>{location?.address || "Remote"}</span>
            {additionalDetails && (
              <span className="small text-muted" style={{ fontSize: "12px" }}>
                <RiFlashlightLine
                  size={12}
                  className="me-1"
                  style={{ verticalAlign: "middle" }}
                />
                {additionalDetails}
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .jdh-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 36px;
          color: #0f172a;
          letter-spacing: -1px;
          line-height: 1.1;
        }
        .jdh-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .badge-urgent {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .badge-new {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }
        .badge-verified {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .jdh-meta {
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
        }
        @media (max-width: 768px) {
          .jdh-title { font-size: 28px; }
          .jdh-meta { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>
    </div>
  );
};

export default JobDetailHeader;
