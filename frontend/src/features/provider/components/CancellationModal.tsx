import React, { useState } from "react";
import {
  RiCloseLine,
  RiErrorWarningLine,
  RiArrowRightLine,
  RiLoader4Line,
} from "react-icons/ri";
import { toast } from "react-toastify";
import { ErrorMessages } from "../../../constants/messages/errorMessages";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  type?: "provider" | "client";
}

const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Cancel Assignment",
  message = "Are you sure you want to cancel this assignment? This action cannot be undone.",
  confirmText = "Confirm Cancellation",
  type = "provider",
}) => {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(notes);
      onClose();
    } catch (error: any) {
      console.error("Cancellation failed", error);
      toast.error(error.message || ErrorMessages.INTERNAL_SERVER_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="qw-modal-overlay"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="qw-modal-content animate-pop-in"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="qw-modal-close-btn"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <RiCloseLine size={24} />
        </button>

        <div className="mb-4 text-center">
          <div className="d-inline-flex p-3 bg-danger-subtle rounded-4 text-danger mb-3">
            <RiErrorWarningLine size={32} />
          </div>
          <h3
            className="fw-bold text-dark mb-2"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            {title}
          </h3>
          <p className="text-muted mb-0 small">{message}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="fw-bold text-dark mb-2 small text-uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Reason / Notes (Optional)
            </label>
            <textarea
              className="form-control rounded-4 p-3 border-light bg-light"
              rows={3}
              placeholder="Provide a reason for cancellation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              style={{ fontSize: "15px", resize: "none" }}
            />
          </div>

          <div className="p-3 bg-red-50 rounded-4 border border-red-100 d-flex gap-3 align-items-start mb-4">
            <RiErrorWarningLine
              className="text-red-500 flex-shrink-0 mt-0-5"
              size={20}
            />
            <p className="small text-red-800 mb-0" style={{ lineHeight: 1.5 }}>
              {type === "provider"
                ? "Cancellations may affect your reliability rating. Please only cancel if absolutely necessary."
                : "Cancelling this assignment will remove the provider from the job and make it available for others again."}
            </p>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn-action-danger d-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="animate-spin" /> Processing...
                </>
              ) : (
                <>
                  {confirmText} <RiArrowRightLine />
                </>
              )}
            </button>
          </div>
        </form>
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
          padding: 40px;
          border-radius: 32px;
          box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.2);
          position: relative;
        }
        .qw-modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qw-modal-close-btn:hover { background: #ef4444; color: white; }
        .btn-action-danger {
          background: #ef4444;
          color: white;
          border: none;
          height: 56px;
          border-radius: 16px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .btn-action-danger:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }
        .btn-action-danger:disabled { opacity: 0.7; cursor: not-allowed; }
        .bg-red-50 { background-color: #fef2f2; }
        .border-red-100 { border-color: #fee2e2; }
        .text-red-500 { color: #ef4444; }
        .text-red-800 { color: #991b1b; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-pop-in { animation: popIn 0.3s ease-out; }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CancellationModal;
