import React, { useState } from "react";
import {
  RiLoader4Line,
  RiBankCardLine
} from "react-icons/ri";
import { financeService } from "../../finance/services/finance.service";
import { toast } from "react-toastify";
import type { UserJob } from "../services/userJob.service";

interface Props {
  job: UserJob;
  onSuccess: () => void;
}

const PayForJobButton: React.FC<Props> = ({ job, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const unpaidCompletedProviders = (job.providers || []).filter(
    (p) => p.finalStatus === "COMPLETED" && p.payment.status !== "completed"
  );

  if (unpaidCompletedProviders.length === 0) return null;

  const payableAmount = unpaidCompletedProviders.reduce(
    (sum, p) => sum + p.payment.totalAmount,
    0
  );

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

  const handleJobPayment = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isProcessing) return;

    try {
      setIsProcessing(true);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your connection.");
        setIsProcessing(false);
        return;
      }

      const orderRes = await financeService.createJobRazorpayOrder(job.id);
      if (!orderRes.success) {
        toast.error(orderRes.message || "Failed to create payment order");
        setIsProcessing(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "QuickWork",
        description: `Full payment for job: ${job.title}`,
        order_id: orderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await financeService.verifyJobRazorpayPayment({
              jobId: job.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.success) {
              toast.success(`Successfully paid ₹${verifyRes.totalProcessedAmount} to ${verifyRes.paidProviders} providers!`);
              onSuccess();
            } else {
              toast.error(verifyRes.message || "Payment verification failed");
            }
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            console.error("Verification Error:", error);
            toast.error(error.response?.data?.message || "Failed to verify payment");
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
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Payment Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <button
      className={`qw-pay-all-btn ${isProcessing ? 'loading' : ''}`}
      onClick={handleJobPayment}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <RiLoader4Line size={18} className="qw-spin" />
      ) : (
        <RiBankCardLine size={18} />
      )}
      <span>Pay ₹{payableAmount}</span>
      <div className="qw-badge-count">{unpaidCompletedProviders.length}</div>
    </button>
  );
};

export default PayForJobButton;
