import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OTP, resendOtp } from "../services/authApi";

const MailOpenIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
    </svg>
);

const OTP_RESEND_COOLDOWN = 60;

const OtpForm = () => {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [timer, setTimer] = useState(OTP_RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as { email: string } | null;
    const email = state?.email || "your email";

    useEffect(() => {
        if (timer <= 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => {
            setTimer((t) => t - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;
        setError("");
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 0) return;
        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtp(newOtp);
        const nextEmpty = newOtp.findIndex((v) => !v);
        inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const otpValue = otp.join("");
    const isComplete = otpValue.length === 6;

    const handleSubmit = async () => {
        if (!isComplete) return;
        try {
            setLoading(true);
            setError(null);
            await OTP({ email, otp: otpValue });
            navigate("/auth/login");
        } catch (err: any) {
            setError(err?.response?.data?.message || "OTP verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        try {
            setLoading(true);
            setError("");
            await resendOtp({ email });
            setOtp(Array(6).fill(""));
            setTimer(OTP_RESEND_COOLDOWN);
            setCanResend(false);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to resend OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff' }}>
                    <MailOpenIcon />
                </div>
                <h1 className="auth-card-title">Verify your email</h1>
                <p className="auth-card-subtitle px-2">
                    We've sent a 6-digit verification code to<br />
                    <span className="fw-semibold text-dark">{email}</span>
                </p>
            </div>

            <div className="otp-input-container" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`otp-input ${digit ? 'is-filled' : ''}`}
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            {error && (
                <div className="auth-error d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-exclamation-circle"></i>
                    {error}
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !isComplete}
                className="btn auth-btn-primary w-100 mb-4"
            >
                {loading ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Verifying...
                    </span>
                ) : "Verify & Continue"}
            </button>

            <div className="text-center">
                {canResend ? (
                    <div className="d-flex flex-column gap-2">
                        <span className="text-secondary" style={{ fontSize: '0.8125rem' }}>Didn't receive the code?</span>
                        <button
                            type="button"
                            onClick={handleResend}
                            className="auth-link p-0 border-0 bg-transparent fw-semibold mx-auto"
                            style={{ fontSize: '0.875rem', width: 'fit-content' }}
                        >
                            Resend OTP
                        </button>
                    </div>
                ) : (
                    <div className="text-secondary" style={{ fontSize: '0.8125rem' }}>
                        Resend code in <span className="fw-semibold text-dark">{formatTime(timer)}</span>
                    </div>
                )}
            </div>

            <div className="auth-ssl-badge mt-4">
                <i className="bi bi-shield-check" style={{ color: '#059669', fontSize: '1rem' }}></i>
                <span>Secure & Encrypted SSL Connection</span>
            </div>
        </div>
    );
};

export default OtpForm;