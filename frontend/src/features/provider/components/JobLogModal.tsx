import React from "react";
import {
  RiHistoryLine,
  RiCloseLine,
  RiCheckDoubleLine,
  RiPlayCircleLine,
  RiNotification3Line,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiErrorWarningLine,
} from "react-icons/ri";

interface LogAssignment {
  invitedAt: string;
  respondedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancellation?: {
    cancelledAt: string;
    notes?: string;
  };
  absence?: {
    reportedAt: string;
    notes?: string;
  };
}

interface JobLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: LogAssignment | null;
}

const JobLogModal: React.FC<JobLogModalProps> = ({
  isOpen,
  onClose,
  assignment,
}) => {
  if (!isOpen || !assignment) return null;

  const events = [
    {
      title: "Job Invitation Sent",
      time: assignment.invitedAt,
      icon: <RiNotification3Line size={20} />,
      color: "#6366f1",
      description: "The client sent an invitation for this job.",
      isDone: true,
    },
    {
      title: "Invitation Accepted",
      time: assignment.respondedAt,
      icon: <RiCheckDoubleLine size={20} />,
      color: "#10b981",
      description: "You accepted the job invitation.",
      isDone: !!assignment.respondedAt,
    },
    {
      title: "Work Commenced",
      time: assignment.startedAt,
      icon: <RiPlayCircleLine size={20} />,
      color: "#f59e0b",
      description: "You started working on this assignment.",
      isDone: !!assignment.startedAt,
    },
    {
      title: "Work Completed",
      time: assignment.completedAt,
      icon: <RiCheckboxCircleLine size={20} />,
      color: "#10b981",
      description: "You submitted the work proof and completed the job.",
      isDone: !!assignment.completedAt,
    },
    {
      title: "Assignment Cancelled",
      time: assignment.cancellation?.cancelledAt,
      icon: <RiCloseLine size={20} />,
      color: "#ef4444",
      description: assignment.cancellation?.notes
        ? `Reason: ${assignment.cancellation.notes}`
        : "The assignment was cancelled.",
      isDone: !!assignment.cancellation?.cancelledAt,
    },
    {
      title: "Absence Reported",
      time: assignment.absence?.reportedAt,
      icon: <RiErrorWarningLine size={20} />,
      color: "#f59e0b",
      description: assignment.absence?.notes
        ? `Notes: ${assignment.absence.notes}`
        : "An absence was reported for this job.",
      isDone: !!assignment.absence?.reportedAt,
    },
  ]
    .filter((e) => e.isDone)
    .sort((a, b) => new Date(b.time || "").getTime() - new Date(a.time || "").getTime());

  return (
    <div className="qw-modal-overlay" onClick={onClose}>
      <div
        className="qw-modal-content animate-pop-in"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="qw-modal-close-btn" onClick={onClose}>
          <RiCloseLine size={24} />
        </button>

        <div className="mb-4">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="p-3 bg-light rounded-4 text-dark">
              <RiHistoryLine size={24} />
            </div>
            <div>
              <h3
                className="fw-bold text-dark mb-0"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Activity Log
              </h3>
              <p className="text-muted mb-0 small">
                Processing timeline for this job
              </p>
            </div>
          </div>
        </div>

        <div className="qw-timeline-container px-2 py-3">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div
                key={index}
                className="qw-timeline-item mb-4 position-relative ps-5"
              >
                {index !== events.length - 1 && (
                  <div
                    className="position-absolute"
                    style={{
                      left: "19px",
                      top: "40px",
                      bottom: "-25px",
                      width: "2px",
                      background: "#f1f5f9",
                    }}
                  />
                )}

                <div
                  className="position-absolute d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                  style={{
                    left: "0",
                    top: "0",
                    width: "40px",
                    height: "40px",
                    background: "white",
                    color: event.color,
                    border: `2px solid ${event.color}15`,
                  }}
                >
                  {event.icon}
                </div>

                <div className="pt-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold text-dark mb-0">{event.title}</h6>
                    <span className="text-muted small d-flex align-items-center gap-1">
                      <RiTimeLine size={14} />{" "}
                      {new Date(event.time || "").toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className="text-muted small mb-0"
                    style={{ lineHeight: 1.4 }}
                  >
                    {event.description}
                  </p>
                  <span
                    className="text-primary fw-bold mt-1 d-inline-block"
                    style={{ fontSize: "11px" }}
                  >
                    {new Date(event.time || "").toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No activity recorded yet.</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-top d-grid">
          <button
            className="btn btn-dark py-3 rounded-4 fw-bold"
            onClick={onClose}
          >
            Close Log
          </button>
        </div>
      </div>

      <style>{`
        .qw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 5000;
        }
        .qw-modal-content {
          background: #ffffff;
          width: 100%;
          padding: 48px 40px;
          border-radius: 42px;
          box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.2);
          position: relative;
        }
        .qw-modal-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qw-modal-close-btn:hover { background: #ef4444; color: white; }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default JobLogModal;
