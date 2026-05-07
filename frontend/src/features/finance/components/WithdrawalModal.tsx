import React, { useState } from "react";
import {
  RiCloseLine,
  RiBankCardLine,
  RiMoneyDollarCircleLine,
  RiAlertLine,
  RiCheckFill,
  RiArrowRightLine
} from "react-icons/ri";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onWithdraw: (amount: number) => Promise<void>;
  loading: boolean;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  balance,
  onWithdraw,
  loading
}) => {
  const [amount, setAmount] = useState<string>("");
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextStep = () => {
    const val = Number(amount);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (val > balance) {
      setError("Amount exceeds available balance");
      return;
    }
    setError(null);
    setStep("confirm");
  };

  const handleWithdraw = async () => {
    await onWithdraw(Number(amount));
    setStep("input");
    setAmount("");
  };

  const handleClose = () => {
    setStep("input");
    setAmount("");
    setError(null);
    onClose();
  };

  return (
    <div className="qw-modal-overlay" onClick={handleClose}>
      <div className="qw-modal-content animate-pop-in" onClick={e => e.stopPropagation()}>
        <div className="qw-modal-header mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className={`qw-header-icon-box ${step === 'confirm' ? 'warning' : 'primary'}`}>
              {step === 'input' ? <RiBankCardLine size={24} /> : <RiAlertLine size={24} />}
            </div>
            <div className="flex-grow-1">
              <h4 className="qw-modal-title">
                {step === 'input' ? "Withdraw Funds" : "Are you sure?"}
              </h4>
              <p className="qw-modal-subtitle">
                {step === 'input' ? "Transfer earnings to your bank account" : "Confirm your withdrawal request"}
              </p>
            </div>
            <button className="qw-modal-close-btn" onClick={handleClose}>
              <RiCloseLine size={24} />
            </button>
          </div>
        </div>

        <div className="qw-modal-body">
          {step === 'input' ? (
            <div className="qw-withdrawal-form">
              <div className="qw-balance-display mb-4">
                <span className="qw-label-tiny">Available Balance</span>
                <h3>₹{balance.toLocaleString()}</h3>
              </div>

              <div className="qw-input-group mb-3">
                <label className="qw-field-label">Withdrawal Amount</label>
                <div className="qw-amount-input-wrapper">
                  <span className="qw-currency-symbol">₹</span>
                  <input
                    type="number"
                    className={`qw-amount-input ${error ? 'error' : ''}`}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError(null);
                    }}
                    autoFocus
                  />
                </div>
                {error && <p className="qw-input-error"><RiAlertLine /> {error}</p>}
              </div>

              <div className="qw-quick-amounts">
                {[500, 1000, 2000, 5000].map(val => (
                  <button
                    key={val}
                    className="qw-quick-btn"
                    onClick={() => setAmount(val.toString())}
                    disabled={val > balance}
                  >
                    +₹{val}
                  </button>
                ))}
                <button
                    className="qw-quick-btn full"
                    onClick={() => setAmount(balance.toString())}
                    disabled={balance <= 0}
                  >
                    Full Balance
                  </button>
              </div>
            </div>
          ) : (
            <div className="qw-confirmation-view">
              <div className="qw-confirm-card mb-4">
                <div className="confirm-row">
                  <span>Withdrawal Amount</span>
                  <span className="confirm-val">₹{Number(amount).toLocaleString()}</span>
                </div>
                <div className="confirm-row">
                  <span>Balance After</span>
                  <span className="confirm-val secondary">₹{(balance - Number(amount)).toLocaleString()}</span>
                </div>
                <div className="confirm-row">
                  <span>Processing Time</span>
                  <span className="confirm-val secondary">Instant</span>
                </div>
              </div>

              <div className="qw-notice-box mb-4">
                <RiMoneyDollarCircleLine size={20} />
                <p>Funds will be deducted from your wallet immediately. Please ensure your bank details are correct.</p>
              </div>
            </div>
          )}
        </div>

        <div className="qw-modal-footer mt-4">
          {step === 'input' ? (
            <button
              className="qw-modal-submit-btn primary"
              onClick={handleNextStep}
              disabled={!amount || Number(amount) <= 0 || Number(amount) > balance}
            >
              <span>Review Withdrawal</span>
              <RiArrowRightLine size={20} />
            </button>
          ) : (
            <div className="d-flex gap-3">
              <button
                className="qw-modal-submit-btn secondary"
                onClick={() => setStep("input")}
                disabled={loading}
              >
                Back
              </button>
              <button
                className="qw-modal-submit-btn primary success"
                onClick={handleWithdraw}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm & Withdraw"}
                {!loading && <RiCheckFill size={22} />}
              </button>
            </div>
          )}
        </div>

        <style>{`
          .qw-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            z-index: 10000;
          }

          .qw-modal-content {
            background: #fff;
            width: 100%;
            max-width: 440px;
            padding: 40px;
            border-radius: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            position: relative;
          }

          .qw-header-icon-box {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qw-header-icon-box.primary { background: #eff6ff; color: #3b82f6; }
          .qw-header-icon-box.warning { background: #fffbeb; color: #f59e0b; }

          .qw-modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; margin: 0; color: #0f172a; }
          .qw-modal-subtitle { color: #64748b; font-size: 13px; margin: 2px 0 0; }

          .qw-modal-close-btn {
            border: none;
            background: #f8fafc;
            width: 36px;
            height: 36px;
            border-radius: 12px;
            color: #94a3b8;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qw-balance-display {
            background: #f8fafc;
            padding: 20px;
            border-radius: 20px;
            text-align: center;
            border: 1px solid #f1f5f9;
          }

          .qw-balance-display h3 { margin: 4px 0 0; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #0f172a; }

          .qw-amount-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .qw-currency-symbol {
            position: absolute;
            left: 20px;
            font-size: 24px;
            font-weight: 800;
            color: #94a3b8;
          }

          .qw-amount-input {
            width: 100%;
            height: 72px;
            padding: 0 20px 0 45px;
            border-radius: 20px;
            border: 2px solid #f1f5f9;
            background: #f8fafc;
            font-size: 32px;
            font-weight: 800;
            color: #0f172a;
            font-family: 'Syne', sans-serif;
            transition: all 0.2s;
            outline: none;
          }

          .qw-amount-input:focus { border-color: #3b82f6; background: #fff; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
          .qw-amount-input.error { border-color: #ef4444; }

          .qw-input-error { font-size: 12px; color: #ef4444; font-weight: 600; margin-top: 8px; display: flex; align-items: center; gap: 4px; }

          .qw-quick-amounts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
          .qw-quick-btn {
            padding: 8px 12px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: #fff;
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            cursor: pointer;
            transition: all 0.2s;
          }
          .qw-quick-btn:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
          .qw-quick-btn:disabled { opacity: 0.5; cursor: not-allowed; }

          .qw-confirm-card { background: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9; }
          .confirm-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .confirm-row:last-child { margin-bottom: 0; }
          .confirm-row span { font-size: 14px; font-weight: 600; color: #64748b; }
          .confirm-val { font-size: 18px; font-weight: 800; color: #0f172a; }
          .confirm-val.secondary { font-size: 14px; color: #3b82f6; }

          .qw-notice-box { background: #fff7ed; padding: 16px; border-radius: 16px; display: flex; gap: 12px; align-items: flex-start; color: #9a3412; }
          .qw-notice-box p { margin: 0; font-size: 12px; font-weight: 600; line-height: 1.5; }

          .qw-modal-submit-btn {
            width: 100%;
            height: 56px;
            border-radius: 16px;
            border: none;
            font-weight: 700;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.2s;
            cursor: pointer;
          }

          .qw-modal-submit-btn.primary { background: #0f172a; color: #fff; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15); }
          .qw-modal-submit-btn.secondary { background: #f1f5f9; color: #475569; }
          .qw-modal-submit-btn.success { background: #16a34a; }
          .qw-modal-submit-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
          .qw-modal-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

          .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .qw-label-tiny { display: block; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
        `}</style>
      </div>
    </div>
  );
};

export default WithdrawalModal;
