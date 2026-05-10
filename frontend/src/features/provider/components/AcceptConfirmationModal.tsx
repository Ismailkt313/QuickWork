import React from "react";
import {
  RiCheckDoubleLine,
  RiCloseLine,
  RiArrowRightLine,
  RiInformationLine,
} from "react-icons/ri";

interface AcceptConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  jobTitle?: string;
  isActionLoading?: boolean;
  budget?: { min: number; max: number };
}

const AcceptConfirmationModal: React.FC<AcceptConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  jobTitle = "this job",
  isActionLoading = false,
  budget,
}) => {
  const suggestedAmount = budget ? (budget.min + budget.max) / 2 : 0;
  const [amount, setAmount] = React.useState<string>(suggestedAmount.toString());
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    if (budget) {
      setAmount(((budget.min + budget.max) / 2).toString());
    }
  }, [budget]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const numAmount = Number(amount);
    if (budget) {
      if (numAmount < budget.min || numAmount > budget.max) {
        setError(`Amount must be between ₹${budget.min} and ₹${budget.max}`);
        return;
      }
    }
    setError("");
    onConfirm(numAmount);
  };

  return (
    <div
      className="qw-modal-overlay"
      onClick={isActionLoading ? undefined : onClose}
    >
      <div
        className="qw-modal-content animate-pop-in"
        style={{ maxWidth: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg, transparent, #6366f1, transparent)",
            opacity: 0.5,
            borderRadius: "42px 42px 0 0",
          }}
        />
        <button
          className="qw-modal-close-btn"
          onClick={onClose}
          disabled={isActionLoading}
          aria-label="Close"
        >
          <RiCloseLine size={24} />
        </button>
        <div className="text-center">
          <div className="position-relative d-inline-block mb-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "24px",
                background: "#eef2ff",
                color: "#6366f1",
                position: "relative",
              }}
            >
              <RiCheckDoubleLine size={36} />
            </div>
          </div>

          <h3
            className="fw-bold text-dark mb-2 px-3"
            style={{
              fontFamily: "Outfit, sans-serif",
              letterSpacing: "-0.03em",
              fontSize: "1.75rem",
              lineHeight: 1.2,
            }}
          >
            Confirm Acceptance
          </h3>

          <p
            className="text-muted mb-4 px-4 mx-auto"
            style={{ fontSize: "15px", lineHeight: "1.6", maxWidth: "400px" }}
          >
            You are about to accept{" "}
            <span className="text-dark fw-bold">{jobTitle}</span>.
          </p>

          {budget && (
            <div className="mb-4 text-start rounded-4" style={{ 
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", 
              padding: "24px",
              border: "1px solid #e2e8f0"
            }}>
              <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Budget Range</span>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>₹{budget.min} — ₹{budget.max}</div>
                </div>
                <div style={{ padding: "6px 12px", background: "white", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested</span>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#6366f1" }}>₹{suggestedAmount}</div>
                </div>
              </div>

              <div className="mb-0">
                <label style={{ fontSize: "11px", color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", display: "block" }}>
                  Confirm Final Payment Amount (₹)
                </label>
                <div className="position-relative">
                  <input
                    type="number"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    style={{ 
                      fontSize: '22px', 
                      fontWeight: '900', 
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: '2px solid #cbd5e1',
                      transition: 'all 0.2s',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError("");
                    }}
                    placeholder="0"
                  />
                  {error && <div className="invalid-feedback fw-bold mt-2 ps-1" style={{ fontSize: "13px" }}>{error}</div>}
                </div>
                <div className="mt-3 d-flex align-items-center gap-2 text-muted" style={{ fontSize: '11px', fontWeight: 600 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1" }}></div>
                  This amount must stay within the client's budget range.
                </div>
                <div className="mt-3 p-2 rounded-3 d-flex align-items-start gap-2" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                  <RiInformationLine size={16} className="mt-1 flex-shrink-0" style={{ color: "#d97706" }} />
                  <div style={{ fontSize: "12px", color: "#b45309", fontWeight: 600, lineHeight: "1.4" }}>
                    A 10% platform fee will be deducted from your final payment.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex flex-column gap-3 mt-4">
            <button
              className="btn-action-primary"
              onClick={handleConfirm}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                <span className="position-relative z-1 d-flex align-items-center justify-content-center gap-2">
                  Accept & Confirm Amount
                  <RiArrowRightLine size={18} />
                </span>
              )}
            </button>

            <button
              className="btn btn-link text-muted fw-bold py-2 border-0 hover-opacity"
              onClick={onClose}
              disabled={isActionLoading}
              style={{
                fontSize: "14px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .qw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .qw-modal-content {
          background: #ffffff;
          width: 100%;
          padding: 48px 40px 36px;
          border-radius: 42px;
          box-shadow:
            0 30px 60px -12px rgba(15, 23, 42, 0.2),
            0 18px 36px -18px rgba(15, 23, 42, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 1);
          position: relative;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .qw-modal-close-btn {
          position: absolute;
          top: 28px;
          right: 28px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          color: #94a3b8;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .qw-modal-close-btn:hover {
          background: #ef4444;
          color: white;
          transform: rotate(90deg) scale(1.1);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          border-color: #ef4444;
        }

        .btn-action-primary {
          background: #0f172a;
          color: white;
          border: none;
          height: 64px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .btn-action-primary:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px -5px rgba(15, 23, 42, 0.35);
          background: #1e293b;
        }

        .btn-action-primary:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-action-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .animate-pop-in {
          animation: popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hover-opacity:hover:not(:disabled) {
          opacity: 0.7;
          color: #0f172a !important;
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }

        @media (max-width: 576px) {
          .qw-modal-content {
            padding: 40px 24px 28px;
            border-radius: 32px;
          }
          .qw-modal-close-btn {
            top: 16px;
            right: 16px;
            width: 36px;
            height: 36px;
          }
          .btn-action-primary {
            height: 56px;
          }
        }
      `}</style>
    </div>
  );
};

export default AcceptConfirmationModal;
