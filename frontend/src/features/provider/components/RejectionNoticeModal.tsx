import React from "react";
import { RiCloseLine, RiAlertFill, RiRefreshLine } from "react-icons/ri";
import "./Modals.css";

interface RejectionNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onRestart: () => void;
  loading?: boolean;
}

const RejectionNoticeModal: React.FC<RejectionNoticeModalProps> = ({
  isOpen,
  onClose,
  reason,
  onRestart,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="qw-modal-backdrop animate__animated animate__fadeIn">
      <div
        className="qw-modal-content edit-profile p-4 animate__animated animate__zoomIn text-center"
        style={{ maxWidth: "500px" }}
      >
        <div className="d-flex justify-content-end mb-2">
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            disabled={loading}
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle"
            style={{ width: "64px", height: "64px" }}
          >
            <RiAlertFill size={32} />
          </div>
          <h2 className="qw-h2 mb-2">Application Rejected</h2>
          <p className="text-secondary small">
            Unfortunately, your provider application has been rejected by our
            administration team.
          </p>
        </div>

        <div className="p-3 rounded-4 bg-light border mb-4 text-start">
          <label className="text-secondary small fw-bold text-uppercase mb-2 d-block">
            Reason for Rejection
          </label>
          <p
            className="mb-0 text-dark"
            style={{ lineHeight: "1.6", fontSize: "14px" }}
          >
            {reason ||
              "No specific reason provided. Please ensure your profile details and portfolio meet our quality standards."}
          </p>
        </div>

        <div
          className="alert alert-warning border-0 rounded-4 small text-start mb-4"
          style={{ background: "#fffbeb" }}
        >
          <p className="mb-0 text-warning-emphasis">
            <strong>Next Steps:</strong> You can restart the onboarding process
            to update your profile and try again. Make sure to address the
            feedback provided above.
          </p>
        </div>

        <div className="d-flex flex-column gap-2">
          <button
            type="button"
            className="btn btn-primary rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            onClick={onRestart}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <RiRefreshLine size={18} />
            )}
            Restart Onboarding
          </button>
          <button
            type="button"
            className="btn btn-link text-secondary text-decoration-none small"
            onClick={onClose}
            disabled={loading}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionNoticeModal;
