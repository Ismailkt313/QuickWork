import React from "react";
import { RiCloseCircleLine } from "react-icons/ri";

interface RejectConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle?: string;
  isActionLoading?: boolean;
}

const RejectConfirmationModal: React.FC<RejectConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  isActionLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex justify-content-end">
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
              disabled={isActionLoading}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4 text-center">
            <div
              className="mb-4 d-inline-flex align-items-center justify-content-center"
              style={{
                width: 72,
                height: 72,
                borderRadius: "20px",
                background: "#fef2f2",
                color: "#ef4444",
              }}
            >
              <RiCloseCircleLine size={40} />
            </div>

            <h3 className="fw-bold mb-2" style={{ fontFamily: "Syne, sans-serif", color: "#0f172a" }}>
              Reject Invitation?
            </h3>

            <p className="text-muted mb-4 px-3" style={{ fontSize: "15px", lineHeight: 1.6 }}>
              Are you sure you want to decline the invitation for <strong className="text-dark">"{jobTitle || "this job"}"</strong>? This action cannot be undone.
            </p>

            <div className="d-flex flex-column gap-2">
              <button
                className="btn btn-danger py-2-5 rounded-3 fw-bold w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                onClick={onConfirm}
                disabled={isActionLoading}
                style={{ backgroundColor: "#ef4444", border: "none" }}
              >
                {isActionLoading ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>Decline Invitation</>
                )}
              </button>
              <button
                className="btn btn-link text-muted text-decoration-none fw-bold w-100 py-2"
                onClick={onClose}
                disabled={isActionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .py-2-5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
      `}</style>
    </div>
  );
};

export default RejectConfirmationModal;
