import React from "react";
import { RiCloseLine, RiTimeLine, RiVerifiedBadgeFill } from "react-icons/ri";
import "./Modals.css";

interface VerificationPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VerificationPendingModal: React.FC<VerificationPendingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="qw-modal-backdrop animate__animated animate__fadeIn">
      <div
        className="qw-modal-content edit-profile p-4 animate__animated animate__zoomIn text-center"
        style={{ maxWidth: "450px" }}
      >
        <div className="d-flex justify-content-end mb-2">
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle"
            style={{ width: "64px", height: "64px" }}
          >
            <RiTimeLine size={32} />
          </div>
          <h2 className="qw-h2 mb-2">Profile Under Verification</h2>
          <p className="text-secondary small px-3">
            Your application is currently being reviewed by our administration
            team. This usually takes 24-48 hours.
          </p>
        </div>

        <div className="p-3 rounded-4 bg-light border mb-4 text-start">
          <div className="d-flex gap-3 align-items-start">
            <div className="text-primary mt-1">
              <RiVerifiedBadgeFill size={20} />
            </div>
            <div>
              <h4 className="small fw-bold mb-1 text-dark">
                Why is this required?
              </h4>
              <p
                className="mb-0 text-secondary"
                style={{ fontSize: "13px", lineHeight: "1.5" }}
              >
                To maintain the highest quality of service on QuickWork, we
                manually verify all professional certificates and identities
                before allowing job interactions.
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex flex-column gap-2">
          <button
            type="button"
            className="btn btn-primary rounded-pill py-2 fw-bold"
            onClick={onClose}
          >
            Got it, I'll wait
          </button>
          <p className="small text-muted mt-2 mb-0">
            We will notify you once your profile is verified.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPendingModal;
