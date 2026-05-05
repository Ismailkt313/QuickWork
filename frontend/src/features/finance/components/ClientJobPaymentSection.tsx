import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { markAsPaidCash } from "../store/paymentSlice";
import type { AppDispatch, RootState } from "../../../app/store";
import { 
  RiCheckboxCircleLine, 
  RiLoader4Line, 
  RiBankCardLine,
  RiCloseLine,
  RiAlertLine,
  RiCashLine,
  RiShieldCheckLine
} from "react-icons/ri";
import { financeService, type WorkHistory } from "../services/finance.service";
import { toast } from "react-toastify";
import PaymentErrorModal from "./PaymentErrorModal";

interface Props {
  assignmentId: string;
  providerName: string;
}

const ClientJobPaymentSection: React.FC<Props> = ({
  assignmentId,
  providerName,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.payment);
  const [history, setHistory] = useState<WorkHistory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: "cash" | "online" }>({
    isOpen: false,
    type: "cash"
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ""
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

  const triggerModal = (type: "cash" | "online") => {
    setModalConfig({ isOpen: true, type });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as unknown as { Razorpay: unknown }).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processAction = async () => {
    if (!history?._id) {
      toast.error("Work history data missing");
      return;
    }

    if (modalConfig.type === "cash") {
      try {
        await dispatch(markAsPaidCash(history._id)).unwrap();
        setModalConfig({ ...modalConfig, isOpen: false });
        
        const res = await financeService.getWorkHistoryByAssignmentId(assignmentId);
        setHistory(res.data);
      } catch(error: any) {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to mark as paid");
      }
    } else {
      
      try {
        setIsProcessing(true);
        console.log("Initiating Online Payment for History:", history._id);
        
        
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          toast.error("Razorpay SDK failed to load. Check your connection.");
          setIsProcessing(false);
          return;
        }

        
        console.log("Creating Razorpay Order...");
        const orderRes = await financeService.createRazorpayOrder(history._id);
        if (!orderRes.success) {
          toast.error(orderRes.message || "Failed to create order");
          setIsProcessing(false);
          return;
        }

        const { orderId, amount, currency, keyId } = orderRes.data;
        console.log("Order Created:", orderId);

        
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "QuickWork",
          description: `Payment for job by ${providerName}`,
          order_id: orderId,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            console.log("Payment Success. Verifying Signature...");
            try {
              
              const verifyRes = await financeService.verifyRazorpayPayment({
                workHistoryId: history._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.success) {
                console.log("Payment Verified Successfully!");
                toast.success("Payment successful!");
                setModalConfig({ ...modalConfig, isOpen: false });
                
                const updated = await financeService.getWorkHistoryByAssignmentId(assignmentId);
                setHistory(updated.data);
              } else {
                setErrorModal({ isOpen: true, message: verifyRes.message || "Payment verification failed." });
              }
            } catch (err: unknown) {
              const error = err as { response?: { data?: { message?: string } } };
              console.error("Verification Error:", error);
              setErrorModal({ isOpen: true, message: error.response?.data?.message || "Something went wrong during payment verification." });
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: "", 
            email: "",
          },
          theme: {
            color: "#6366f1",
          },
          modal: {
            ondismiss: () => {
              console.log("Razorpay modal dismissed");
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void; on: (event: string, cb: (res: { error: { description: string } }) => void) => void; close?: () => void } }).Razorpay(options);
        rzp.on('payment.failed', (response: { error: { description: string } }) => {
          console.error("Payment Failed event:", response.error);
          if (typeof rzp.close === 'function') rzp.close();
          setErrorModal({ 
            isOpen: true, 
            message: response.error.description || "The payment was declined by your bank or the payment gateway." 
          });
          setIsProcessing(false);
        });
        rzp.open();
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        console.error("Payment Initiation Error:", err);
        setErrorModal({ 
          isOpen: true, 
          message: err.response?.data?.message || "We couldn't connect to the payment gateway. Please try again later." 
        });
        setIsProcessing(false);
      }
    }
  };

  if (!history) return null;

  const { status, totalAmount } = history.payment;

  return (
    <>
      <div className="qw-client-payment-card animate-fade-in">
        <div className="qw-payment-header">
          <div className="qw-provider-avatar">
            {providerName.slice(0, 1).toUpperCase()}
          </div>
          <div className="qw-payment-info">
            <h6>{providerName}</h6>
            <p>Work completed • ₹{totalAmount}</p>
          </div>
          <div className={`qw-status-badge ${status}`}>
            {status.replace("_", " ")}
          </div>
        </div>

        <div className="qw-payment-footer">
          <div className="qw-payment-actions-grid">
            {}
            {status !== "completed" && (
              <button
                className="qw-btn-pay online"
                onClick={() => triggerModal("online")}
                disabled={loading}
              >
                <RiBankCardLine size={18} />
                <span>Pay Now</span>
              </button>
            )}

            {}
            {status === "pending" && (
              <button
                className="qw-btn-pay cash"
                onClick={() => triggerModal("cash")}
                disabled={loading}
              >
                <RiCashLine size={18} />
                <span>Mark as Paid (Cash)</span>
              </button>
            )}

            {}
            {status === "awaiting_confirmation" && (
              <div className="qw-payment-status-tip warning">
                <RiLoader4Line className="qw-spin" size={16} />
                <span>Awaiting provider's confirmation</span>
              </div>
            )}

            {status === "completed" && (
              <div className="qw-payment-status-tip success full-width">
                <RiCheckboxCircleLine size={16} />
                <span>Payment successfully completed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Rendered via Portal */}
      {modalConfig.isOpen && createPortal(
        <div className="qw-confirm-overlay" onClick={() => !isProcessing && setModalConfig({ ...modalConfig, isOpen: false })}>
          <div className="qw-confirm-modal animate-pop-in" onClick={(e) => e.stopPropagation()}>
            {!isProcessing && (
              <button className="qw-confirm-close" onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}>
                <RiCloseLine size={20} />
              </button>
            )}
            
            <div className={`qw-confirm-icon-box ${modalConfig.type}`}>
              {isProcessing ? (
                <RiLoader4Line size={32} className="qw-spin" />
              ) : (
                modalConfig.type === "online" ? <RiBankCardLine size={32} /> : <RiCashLine size={32} />
              )}
            </div>

            <h3>
              {isProcessing ? "Processing Payment..." : (modalConfig.type === "online" ? "Online Payment" : "Confirm Cash Payment")}
            </h3>
            
            {!isProcessing && (
              <div className="qw-modal-amount-tag">
                <span className="label">Amount to Pay</span>
                <span className="value">₹{totalAmount}</span>
              </div>
            )}

            <p className="qw-confirm-desc">
              {isProcessing ? (
                <>Please wait while we securely process your transaction. Do not close this window.</>
              ) : (
                modalConfig.type === "online" ? (
                  <>You are about to pay <strong>₹{totalAmount}</strong> online to <strong>{providerName}</strong>. This action is secure and encrypted.</>
                ) : (
                  <>Are you sure you have paid <strong>₹{totalAmount}</strong> in cash? The provider will need to confirm receipt on their end.</>
                )
              )}
            </p>

            {!isProcessing && (status === "completed" || status === "awaiting_confirmation") && modalConfig.type === "online" && (
              <div className="qw-modal-warning">
                <RiAlertLine size={16} />
                <span>Note: A cash transaction is already in progress or completed. Online payment will be a duplicate.</span>
              </div>
            )}

            {!isProcessing && (
              <div className="qw-modal-security-tip">
                <RiShieldCheckLine size={14} />
                <span>Secure 256-bit SSL encrypted payment</span>
              </div>
            )}

            <div className="qw-confirm-actions">
              <button 
                className="qw-confirm-btn-cancel" 
                onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className={`qw-confirm-btn-proceed ${modalConfig.type}`} 
                onClick={processAction}
                disabled={loading || isProcessing}
              >
                {loading || isProcessing ? <RiLoader4Line className="qw-spin" /> : (modalConfig.type === "online" ? "Proceed to Pay" : "Confirm Cash Paid")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <PaymentErrorModal 
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        onRetry={() => {
          setErrorModal({ ...errorModal, isOpen: false });
          processAction();
        }}
        errorMessage={errorModal.message}
      />

      <style>{`
        .qw-client-payment-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          margin-bottom: 16px;
        }

        .qw-payment-header {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f8fafc;
        }

        .qw-provider-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          flex-shrink: 0;
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

        .qw-payment-footer {
          padding: 12px 20px 16px;
          background: #fdfdfd;
        }

        .qw-payment-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .qw-btn-pay {
          height: 42px;
          border-radius: 11px;
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

        .qw-btn-pay.online {
          background: #0f172a;
          color: #fff;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
        }

        .qw-btn-pay.cash {
          background: #fff;
          border: 1.5px solid #e2e8f0;
          color: #16a34a;
        }

        .qw-btn-pay:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        .qw-payment-status-tip {
          grid-column: span 1;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 600;
          border-radius: 11px;
        }

        .qw-payment-status-tip.warning { background: #fffbeb; color: #92400e; }
        .qw-payment-status-tip.success { background: #f0fdf4; color: #16a34a; }
        .qw-payment-status-tip.full-width { grid-column: span 2; justify-content: center; height: 42px; }

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
          max-width: 420px;
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

        .qw-confirm-icon-box.online { background: #eff6ff; color: #3b82f6; }
        .qw-confirm-icon-box.cash { background: #f0fdf4; color: #16a34a; }

        .qw-confirm-modal h3 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          margin-bottom: 8px;
          color: #0f172a;
        }

        .qw-modal-amount-tag {
          display: inline-flex;
          flex-direction: column;
          background: #f8fafc;
          padding: 10px 24px;
          border-radius: 16px;
          margin-bottom: 20px;
        }

        .qw-modal-amount-tag .label { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
        .qw-modal-amount-tag .value { font-size: 24px; color: #0f172a; font-weight: 800; }

        .qw-confirm-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .qw-modal-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: #fff7ed;
          border-radius: 14px;
          color: #c2410c;
          font-size: 12px;
          text-align: left;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .qw-modal-security-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #10b981;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 24px;
          background: #f0fdf4;
          padding: 6px 12px;
          border-radius: 100px;
          align-self: center;
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

        .qw-confirm-btn-proceed.online { background: #0f172a; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
        .qw-confirm-btn-proceed.cash { background: #16a34a; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2); }

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

export default ClientJobPaymentSection;
