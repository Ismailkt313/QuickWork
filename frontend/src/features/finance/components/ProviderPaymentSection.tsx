import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { confirmPayment, rejectPayment } from "../store/paymentSlice";
import type { AppDispatch, RootState } from "../../../app/store";
import { 
  RiCheckboxCircleLine, 
  RiLoader4Line, 
  RiMoneyDollarCircleLine,
  RiHandCoinLine,
  RiInformationLine,
  RiCloseLine,
  RiAlertLine,
  RiArrowGoBackLine
} from "react-icons/ri";
import { financeService, type WorkHistory } from "../services/finance.service";

interface Props {
  assignmentId: string;
  jobTitle: string;
  clientName: string;
}

const ProviderPaymentSection: React.FC<Props> = ({
  assignmentId,
  jobTitle,
  clientName,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.payment);
  const [history, setHistory] = useState<WorkHistory | null>(null);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: "confirm" | "reject" }>({
    isOpen: false,
    type: "confirm"
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await financeService.getWorkHistoryByAssignmentId(assignmentId);
        setHistory(response.data);
      } catch (error) {
        console.error("Failed to fetch work history", error);
      }
    };
    fetchHistory();
  }, [assignmentId]);

  const triggerModal = (type: "confirm" | "reject") => {
    setModalConfig({ isOpen: true, type });
  };

  const processAction = async () => {
    if (!history?._id) return;

    if (modalConfig.type === "confirm") {
      await dispatch(confirmPayment(history._id));
    } else {
      await dispatch(rejectPayment(history._id));
    }

    setModalConfig({ ...modalConfig, isOpen: false });
    
    setTimeout(() => {
      financeService.getWorkHistoryByAssignmentId(assignmentId).then(res => setHistory(res.data));
    }, 2000);
  };

  if (!history) return null;

  const { status, totalAmount, platformFee, providerAmount } = history.payment;

  return (
    <>
      <div className="qw-payment-card animate-fade-in">
        <div className="qw-payment-header">
          <div className="qw-payment-icon">
            <RiMoneyDollarCircleLine size={20} />
          </div>
          <div className="qw-payment-info">
            <h6>Payment Overview</h6>
            <p>Assignment: {jobTitle}</p>
          </div>
          <div className={`qw-status-badge ${status}`}>
            {status.replace("_", " ")}
          </div>
        </div>

        <div className="qw-payment-details">
          <div className="qw-detail-row">
            <span className="label">Total Budget</span>
            <span className="value">₹{totalAmount}</span>
          </div>
          <div className="qw-detail-row">
            <span className="label">Platform Fee (10%)</span>
            <span className="value text-danger">-₹{platformFee}</span>
          </div>
          <div className="qw-detail-row total">
            <span className="label">Your Earnings</span>
            <span className="value">₹{providerAmount}</span>
          </div>
        </div>

        <div className="qw-payment-footer">
          {status === "pending" && (
            <div className="qw-action-area pending">
              <div className="qw-info-tip">
                <RiInformationLine size={14} />
                <span>Did you receive the cash payment?</span>
              </div>
              <button
                className="qw-btn-confirm success premium"
                onClick={() => triggerModal("confirm")}
                disabled={loading}
              >
                <div className="qw-btn-content">
                  {loading ? <RiLoader4Line className="qw-spin" /> : <RiHandCoinLine size={18} />}
                  <span>{loading ? "Processing..." : "Received Money in Hand"}</span>
                </div>
              </button>
              <p className="qw-action-hint">This will finalize your earnings from <strong>{clientName}</strong></p>
            </div>
          )}

          {status === "awaiting_confirmation" && (
            <div className="qw-action-area">
              <div className="qw-info-tip warning">
                <RiInformationLine size={14} />
                <span>Confirm receipt of payment</span>
              </div>
              <div className="qw-dual-actions">
                <button
                  className="qw-btn-confirm primary"
                  onClick={() => triggerModal("confirm")}
                  disabled={loading}
                >
                  {loading ? <RiLoader4Line className="qw-spin" /> : <RiCheckboxCircleLine size={16} />}
                  {loading ? "..." : "Confirm Receipt"}
                </button>
                <button
                  className="qw-btn-reject"
                  onClick={() => triggerModal("reject")}
                  disabled={loading}
                  title="Payment not received"
                >
                  <RiCloseLine size={18} />
                  <span>Not Paid</span>
                </button>
              </div>
            </div>
          )}

          {status === "completed" && (
            <div className="qw-payment-done">
              <RiCheckboxCircleLine size={18} />
              <span>Transaction Completed & Paid</span>
            </div>
          )}
        </div>
      </div>

      {}
      {modalConfig.isOpen && (
        <div className="qw-confirm-overlay" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
          <div className="qw-confirm-modal animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <button className="qw-confirm-close" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
              <RiCloseLine size={20} />
            </button>
            
            <div className={`qw-confirm-icon-box ${modalConfig.type}`}>
              {modalConfig.type === "confirm" ? <RiAlertLine size={32} /> : <RiArrowGoBackLine size={32} />}
            </div>

            <h3>{modalConfig.type === "confirm" ? "Confirm Receipt" : "Reject Confirmation"}</h3>
            <p>
              {modalConfig.type === "confirm" ? (
                <>Are you sure you have received <strong>₹{totalAmount}</strong> in cash from <strong>{clientName}</strong>? This will finalize the transaction.</>
              ) : (
                <>Are you saying you <strong>haven't</strong> received the money yet? The payment status will return to pending for the client.</>
              )}
            </p>

            <div className="qw-confirm-actions">
              <button className="qw-confirm-btn-cancel" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                Cancel
              </button>
              <button 
                className={`qw-confirm-btn-proceed ${modalConfig.type}`} 
                onClick={processAction}
                disabled={loading}
              >
                {loading ? <RiLoader4Line className="qw-spin" /> : (modalConfig.type === "confirm" ? "Yes, I Received It" : "Yes, Not Received")}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .qw-payment-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }

        .qw-payment-header {
          padding: 16px 20px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .qw-payment-icon {
          width: 36px;
          height: 36px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qw-payment-info {
          flex: 1;
        }

        .qw-payment-info h6 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .qw-payment-info p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .qw-status-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          letter-spacing: 0.02em;
        }

        .qw-status-badge.pending { background: #f1f5f9; color: #475569; }
        .qw-status-badge.awaiting_confirmation { background: #fff7ed; color: #c2410c; }
        .qw-status-badge.completed { background: #f0fdf4; color: #16a34a; }

        .qw-payment-details {
          padding: 16px 20px;
        }

        .qw-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .qw-detail-row .label {
          font-size: 13px;
          color: #64748b;
        }

        .qw-detail-row .value {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }

        .qw-detail-row.total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #e2e8f0;
        }

        .qw-detail-row.total .label {
          font-weight: 700;
          color: #0f172a;
        }

        .qw-detail-row.total .value {
          font-size: 16px;
          font-weight: 800;
          color: #16a34a;
        }

        .qw-payment-footer {
          padding: 16px 20px;
          background: #fdfdfd;
        }

        .qw-action-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .qw-dual-actions {
          display: flex;
          gap: 8px;
          align-items: stretch;
          width: 100%;
        }

        .qw-info-tip {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #475569;
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .qw-info-tip.warning {
          background: #fffbeb;
          color: #92400e;
        }

        .qw-btn-confirm {
          flex: 1.6;
          height: 46px;
          border-radius: 12px;
          border: none;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .qw-btn-reject {
          flex: 1;
          height: 46px;
          border-radius: 12px;
          border: 1.5px solid #fee2e2;
          background: #fff;
          color: #ef4444;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .qw-btn-reject:hover:not(:disabled) {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .qw-btn-confirm.success.premium {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 4px 15px rgba(22, 163, 74, 0.25);
          height: 50px;
        }

        .qw-btn-confirm.success.premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(22, 163, 74, 0.3);
        }

        .qw-btn-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .qw-btn-confirm.primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
        }

        .qw-action-hint {
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          margin: 6px 0 0;
          font-weight: 500;
        }

        .qw-btn-confirm:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        .qw-btn-confirm:disabled, .qw-btn-reject:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .qw-payment-done {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: #f0fdf4;
          color: #16a34a;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
        }

        /* Modal Styles */
        .qw-confirm-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 999999;
        }

        .leaflet-container {
          z-index: 0 !important;
        }

        .qw-confirm-modal {
          background: #fff;
          width: 100%;
          max-width: 400px;
          padding: 40px 32px;
          border-radius: 28px;
          text-align: center;
          position: relative;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .qw-confirm-close {
          position: absolute;
          top: 20px;
          right: 20px;
          border: none;
          background: #f8fafc;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qw-confirm-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }

        .qw-confirm-icon-box.confirm {
          background: #fffbeb;
          color: #f59e0b;
        }

        .qw-confirm-icon-box.reject {
          background: #fef2f2;
          color: #ef4444;
        }

        .qw-confirm-modal h3 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          margin-bottom: 12px;
          color: #0f172a;
        }

        .qw-confirm-modal p {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .qw-confirm-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .qw-confirm-btn-cancel {
          height: 48px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }

        .qw-confirm-btn-proceed {
          height: 48px;
          border-radius: 14px;
          border: none;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .qw-confirm-btn-proceed.confirm {
          background: #16a34a;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
        }

        .qw-confirm-btn-proceed.reject {
          background: #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .qw-spin { animation: qw-spin 1s linear infinite; }
        @keyframes qw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default ProviderPaymentSection;
