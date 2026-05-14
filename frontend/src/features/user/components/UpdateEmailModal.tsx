import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { RiMailLine, RiShieldCheckLine, RiArrowLeftSLine, RiRefreshLine } from "react-icons/ri";
import { AxiosError } from "axios";
import {
  sendEmailUpdateOtp,
  verifyEmailUpdate,
  resendEmailUpdateOtp,
} from "../../auth/services/authApi";

interface UpdateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: () => void;
}

type Step = "email" | "otp";

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 120;

const UpdateEmailModal: React.FC<UpdateEmailModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>("email");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setStep("email");
      setNewEmail("");
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      setCountdown(0);
      setLoading(false);
      setResending(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendOtp = async () => {
    setError("");
    const trimmed = newEmail.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter a new email address");
      return;
    }
    if (!isValidEmail(trimmed)) {
      setError("Please enter a valid email address");
      return;
    }
    if (trimmed === currentEmail.toLowerCase()) {
      setError("New email must be different from current email");
      return;
    }

    setLoading(true);
    try {
      await sendEmailUpdateOtp({ newEmail: trimmed });
      setStep("otp");
      setCountdown(COUNTDOWN_SECONDS);
      toast.success("Verification code sent to your new email");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pastedData.length > 0) {
      const newOtp = Array(OTP_LENGTH).fill("");
      pastedData.split("").forEach((char, i) => { newOtp[i] = char; });
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  }, []);

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete verification code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await verifyEmailUpdate({ newEmail: newEmail.trim().toLowerCase(), otp: code });
      if (result.success) {
        toast.success("Email updated successfully!");
        onSuccess();
        onClose();
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Invalid verification code");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await resendEmailUpdateOtp({ newEmail: newEmail.trim().toLowerCase() });
      setCountdown(COUNTDOWN_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(""));
      toast.success("Verification code resent");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(15,23,42,0.65)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        animation: "qwFadeIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : "460px",
          background: "#fff",
          borderRadius: isMobile ? "24px 24px 0 0" : "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
          animation: isMobile
            ? "qwMobileSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
            : "qwSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {isMobile && (
          <div style={{
            width: 40, height: 4, background: "#e2e8f0",
            borderRadius: 2, margin: "12px auto 0", flexShrink: 0
          }} />
        )}

        <div style={{
          background: "linear-gradient(135deg, #3b82f6, #6366f1)",
          padding: "24px",
          flexShrink: 0,
          position: "relative",
        }}>
          {step === "otp" && (
            <button
              onClick={() => { setStep("email"); setOtp(Array(OTP_LENGTH).fill("")); setError(""); }}
              style={{
                position: "absolute", left: 16, top: 16,
                background: "rgba(255,255,255,0.15)", border: "none",
                borderRadius: 10, width: 36, height: 36, display: "flex",
                alignItems: "center", justifyContent: "center", color: "#fff",
                cursor: "pointer", backdropFilter: "blur(4px)",
              }}
            >
              <RiArrowLeftSLine size={20} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              position: "absolute", right: 16, top: 16,
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: 10, width: 36, height: 36, display: "flex",
              alignItems: "center", justifyContent: "center", color: "#fff",
              cursor: "pointer", fontSize: 18, backdropFilter: "blur(4px)",
            }}
          >
            ✕
          </button>
          <div style={{ textAlign: "center", paddingTop: step === "otp" ? 8 : 0 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", backdropFilter: "blur(4px)",
            }}>
              {step === "email" ? <RiMailLine size={24} color="#fff" /> : <RiShieldCheckLine size={24} color="#fff" />}
            </div>
            <h5 style={{
              color: "#fff", fontWeight: 800, fontSize: 18, margin: 0,
              letterSpacing: "-0.01em",
            }}>
              {step === "email" ? "Update Email Address" : "Verify Your Email"}
            </h5>
            <p style={{
              color: "rgba(255,255,255,0.8)", fontSize: 13,
              margin: "6px 0 0", fontWeight: 500,
            }}>
              {step === "email"
                ? "Enter your new email to receive a verification code"
                : `Enter the 6-digit code sent to ${newEmail}`}
            </p>
          </div>
        </div>

        <div style={{ padding: 24, overflowY: "auto", flexGrow: 1 }}>
          {step === "email" ? (
            <>
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 700,
                  color: "#64748b", textTransform: "uppercase" as const,
                  letterSpacing: "0.04em", marginBottom: 8,
                }}>
                  Current Email
                </label>
                <div style={{
                  padding: "12px 16px", borderRadius: 12,
                  background: "#f8fafc", border: "1px solid #e2e8f0",
                  fontSize: 14, color: "#94a3b8", fontWeight: 500,
                }}>
                  {currentEmail}
                </div>
              </div>
              <div style={{ marginBottom: 20, marginTop: 16 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 700,
                  color: "#64748b", textTransform: "uppercase" as const,
                  letterSpacing: "0.04em", marginBottom: 8,
                }}>
                  New Email Address
                </label>
                <div style={{
                  display: "flex", alignItems: "center", gap: 0,
                  border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`,
                  borderRadius: 12, overflow: "hidden",
                  transition: "border-color 0.2s",
                  background: "#fff",
                }}>
                  <span style={{
                    padding: "0 14px", color: "#94a3b8",
                    display: "flex", alignItems: "center",
                  }}>
                    <RiMailLine size={18} />
                  </span>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                    placeholder="Enter new email address"
                    autoFocus
                    style={{
                      flex: 1, border: "none", outline: "none",
                      padding: "14px 16px 14px 0", fontSize: isMobile ? 16 : 14,
                      fontWeight: 500, color: "#0f172a",
                      background: "transparent",
                    }}
                  />
                </div>
                {error && (
                  <p style={{
                    color: "#ef4444", fontSize: 12, fontWeight: 600,
                    margin: "8px 0 0 4px",
                  }}>
                    {error}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div style={{
                display: "flex", justifyContent: "center",
                gap: isMobile ? 8 : 10, marginBottom: 16,
              }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    autoFocus={i === 0}
                    style={{
                      width: isMobile ? 44 : 48,
                      height: isMobile ? 52 : 56,
                      borderRadius: 14,
                      border: `2px solid ${digit ? "#3b82f6" : error ? "#ef4444" : "#e2e8f0"}`,
                      textAlign: "center" as const,
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0f172a",
                      outline: "none",
                      background: digit ? "#eff6ff" : "#fff",
                      transition: "all 0.2s",
                      caretColor: "#3b82f6",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)"; }}
                    onBlur={(e) => { e.target.style.borderColor = digit ? "#3b82f6" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  />
                ))}
              </div>
              {error && (
                <p style={{
                  color: "#ef4444", fontSize: 12, fontWeight: 600,
                  textAlign: "center" as const, margin: "0 0 12px",
                }}>
                  {error}
                </p>
              )}

              <div style={{
                padding: "10px 16px", borderRadius: 10,
                background: countdown <= 0 ? "#fef2f2" : "#f0f9ff",
                border: `1px solid ${countdown <= 0 ? "#fecaca" : "#bae6fd"}`,
                textAlign: "center" as const,
                marginBottom: 12,
                transition: "all 0.3s ease",
              }}>
                {countdown <= 0 ? (
                  <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                    ⚠ Code expired — please resend to get a new code
                  </span>
                ) : (
                  <span style={{ fontSize: 13, color: "#0369a1", fontWeight: 500 }}>
                    Code expires in{" "}
                    <span style={{ fontWeight: 700, color: countdown <= 30 ? "#dc2626" : "#0369a1" }}>
                      {formatCountdown(countdown)}
                    </span>
                  </span>
                )}
              </div>

              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
                marginBottom: 4,
              }}>
                {countdown > 0 ? (
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>
                    Didn't receive the code? Resend available after expiry
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    disabled={resending}
                    style={{
                      background: "none", border: "none",
                      color: "#3b82f6", fontWeight: 700, fontSize: 13,
                      cursor: "pointer", display: "flex",
                      alignItems: "center", gap: 4,
                      opacity: resending ? 0.5 : 1,
                    }}
                  >
                    <RiRefreshLine size={14} className={resending ? "spin" : ""} />
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div style={{
          padding: "0 24px 24px",
          paddingBottom: isMobile ? "calc(24px + env(safe-area-inset-bottom))" : 24,
          display: "flex", gap: 12,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, height: 50, borderRadius: 14,
              border: "1px solid #e2e8f0", background: "#f8fafc",
              color: "#64748b", fontWeight: 700, fontSize: 14,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={step === "email" ? handleSendOtp : handleVerifyOtp}
            disabled={loading || (step === "email" ? !newEmail.trim() : otp.join("").length !== OTP_LENGTH)}
            style={{
              flex: 2, height: 50, borderRadius: 14,
              border: "none",
              background: loading || (step === "email" ? !newEmail.trim() : otp.join("").length !== OTP_LENGTH)
                ? "#cbd5e1"
                : "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff", fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 4px 12px rgba(59,130,246,0.3)",
            }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : step === "email" ? (
              <>
                <RiMailLine size={16} />
                Send Verification Code
              </>
            ) : (
              <>
                <RiShieldCheckLine size={16} />
                Verify & Update
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes qwFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes qwSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes qwMobileSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UpdateEmailModal;
