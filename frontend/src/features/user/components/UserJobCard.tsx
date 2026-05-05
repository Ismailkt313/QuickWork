import React from "react";
import {
  RiMapPinLine,
  RiCalendarLine,
  RiMoneyDollarCircleLine,
  RiMore2Fill,
  RiEyeLine,
  RiCloseCircleLine,
  RiFocus2Line,
  RiLockLine,
  RiGlobeLine,
} from "react-icons/ri";
import type { UserJob } from "../services/userJob.service";
import PayForJobButton from "./PayForJobButton";

interface UserJobCardProps {
  job: UserJob;
  onCancel?: (id: string) => void;
  onView?: (id: string) => void;
  onRefresh: () => void;
}

const UserJobCard: React.FC<UserJobCardProps> = ({ job, onCancel, onView, onRefresh }) => {
  const isPrivate = job.visibility === "private";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return {
          label: "Pending",
          color: "#6366f1",
          bg: "rgba(99, 102, 241, 0.1)",
        };
      case "partially_assigned":
        return {
          label: "Partially Assigned",
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.1)",
        };
      case "fully_assigned":
        return {
          label: "Fully Assigned",
          color: "#10b981",
          bg: "rgba(16, 185, 129, 0.1)",
        };
      case "in_progress":
        return {
          label: "In Progress",
          color: "#3b82f6",
          bg: "rgba(59, 130, 246, 0.1)",
        };
      case "completed":
        return {
          label: "Completed",
          color: "#10b981",
          bg: "rgba(16, 185, 129, 0.1)",
        };
      case "cancelled":
        return {
          label: "Cancelled",
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.1)",
        };
      default:
        return {
          label: status,
          color: "#64748b",
          bg: "rgba(100, 116, 139, 0.1)",
        };
    }
  };

  const status = getStatusConfig(job.status);
  const skillName = (job.skills && job.skills.length > 0) ? job.skills[0] : (job.categoryName || "General Service");

  return (
    <div className="qw-job-card" onClick={() => onView?.(job.id)}>
      <div className="qw-card-accent" style={{ background: status.color }} />

      <div className="p-4 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex flex-wrap gap-2">
            <div
              className="qw-status-badge"
              style={{ color: status.color, backgroundColor: status.bg }}
            >
              <span
                className="qw-dot"
                style={{ backgroundColor: status.color }}
              />
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
            {job.hasPendingPayment && (
              <div
                className="qw-visibility-badge"
                style={{
                  background: "#fff7ed",
                  color: "#ea580c",
                  border: "1px solid #fed7aa",
                }}
              >
                <RiMoneyDollarCircleLine size={14} /> Payment Pending
              </div>
            )}
          </div>

          <div className="qw-job-card-actions">
            <div className="dropdown" onClick={(e) => e.stopPropagation()}>
              <button className="qw-more-btn" data-bs-toggle="dropdown">
                <RiMore2Fill size={20} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2">
                <li>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-3"
                    onClick={() => onView?.(job.id)}
                  >
                    <RiEyeLine size={18} /> View Details
                  </button>
                </li>
                {(job.status === "open" ||
                  job.status === "partially_assigned" ||
                  job.status === "fully_assigned" ||
                  job.status === "in_progress") && (
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-3 text-danger"
                      onClick={() => onCancel?.(job.id)}
                    >
                      <RiCloseCircleLine size={18} /> Cancel Job
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-4" style={{ minHeight: '60px' }}>
          <h5 className="qw-job-title mb-2 text-truncate">{job.title}</h5>
          <div
            className="d-flex align-items-center gap-2 text-muted"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <RiFocus2Line className="text-primary" size={16} />
            {skillName}
          </div>
        </div>

        <div className="qw-info-grid mb-4">
          <div className="qw-info-item">
            <RiMapPinLine className="qw-info-icon" />
            <span className="text-truncate">{job.locationName || "Remote"}</span>
          </div>
          <div className="qw-info-item">
            <RiCalendarLine className="qw-info-icon" />
            <span>{job.schedule?.startDate ? new Date(job.schedule.startDate).toLocaleDateString() : "TBD"}</span>
          </div>
        </div>

        {/* Payment Status Row */}
        {job.providers && job.providers.length > 0 && job.providers.some(p => p.finalStatus === "COMPLETED") && (
          <div className="qw-payment-row mb-3" onClick={(e) => e.stopPropagation()}>
            {job.providers.filter(p => p.finalStatus === "COMPLETED").map((p, i) => (
              <div key={i} className="qw-pay-chip-item">
                <span className={`qw-pay-chip ${
                  p.payment.status === "completed" ? "paid" : 
                  p.payment.status === "awaiting_confirmation" || p.payment.status === "awaiting_provider_confirmation" ? "awaiting" : "unpaid"
                }`}>
                  <RiMoneyDollarCircleLine size={12} />
                  ₹{p.payment.totalAmount.toLocaleString()} 
                  <span className="qw-pay-chip-label">
                    {p.payment.status === "completed" ? "Paid" : 
                     p.payment.status?.includes("awaiting") ? "Awaiting" : "Unpaid"}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="qw-card-footer pt-3 mt-auto">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex flex-column">
              <span className="qw-footer-label">Budget</span>
              <div className="d-flex align-items-center gap-1 fw-bold text-dark fs-5">
                <RiMoneyDollarCircleLine size={20} className="text-success" />
                {job.budget}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <PayForJobButton job={job} onSuccess={onRefresh} />
              
              {["completed", "cancelled", "rejected"].includes(job.status) ? (
                <div className="qw-status-display">
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </div>
              ) : (
                <button
                  className="qw-cancel-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel?.(job.id);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
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
          min-height: 420px;
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
          opacity: 0.8;
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
          gap: 4px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .qw-visibility-badge.private { background: #0f172a; color: white; }
        .qw-visibility-badge.public { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        .qw-job-card-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qw-pay-all-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }

        .qw-pay-all-btn:hover:not(:disabled) {
          background: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
        }

        .qw-pay-all-btn:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.8;
        }

        .qw-badge-count {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .qw-more-btn {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }

        .qw-more-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .qw-job-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          color: #0f172a;
          font-size: 17px;
          margin: 0;
          height: 24px;
          line-height: 24px;
        }

        .qw-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          height: 38px;
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

        .qw-manage-btn, .qw-status-display {
          background: #f8fafc;
          color: #94a3b8;
          border: 1px solid #f1f5f9;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 100px;
        }

        .qw-cancel-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
          min-width: 100px;
        }

        .qw-cancel-btn:hover {
          background: #ef4444;
          color: white;
        }

        @media (max-width: 576px) {
          .qw-info-grid { grid-template-columns: 1fr; }
        }

        /* Payment Status Row */
        .qw-payment-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 14px;
          background: #f8fafc;
          border-radius: 14px;
          border: 1px solid #f1f5f9;
        }

        .qw-pay-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 100px;
        }

        .qw-pay-chip.paid { background: #f0fdf4; color: #16a34a; }
        .qw-pay-chip.awaiting { background: #fffbeb; color: #f59e0b; }
        .qw-pay-chip.unpaid { background: #f1f5f9; color: #64748b; }

        .qw-pay-chip-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default UserJobCard;
