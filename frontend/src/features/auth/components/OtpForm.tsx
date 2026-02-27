import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OTP } from "../services/authApi";

import "../auth.css";

const ShieldCheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#22c55e" />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MailOpenIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
    </svg>
);

const styles = {
    iconWrapper: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px",
    } as React.CSSProperties,

    iconCircle: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        backgroundColor: "#eff6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    } as React.CSSProperties,

    title: {
        fontSize: "24px",
        fontWeight: 700,
        color: "#111827",
        textAlign: "center" as const,
        margin: 0,
        lineHeight: 1.3,
    } as React.CSSProperties,

    subtitle: {
        fontSize: "14px",
        color: "#6b7280",
        textAlign: "center" as const,
        marginTop: "8px",
        marginBottom: 0,
        lineHeight: 1.6,
    } as React.CSSProperties,

    emailHighlight: {
        fontWeight: 600,
        color: "#111827",
    } as React.CSSProperties,

    verifyBtn: {
        width: "100%",
        padding: "14px",
        borderRadius: "12px",
        borderWidth: 0,
        borderStyle: "none",
        backgroundColor: "#2563eb",
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
        transition: "background-color 0.2s, box-shadow 0.2s, opacity 0.2s",
        marginTop: "24px",
    } as React.CSSProperties,

    verifyBtnDisabled: {
        opacity: 0.5,
        cursor: "not-allowed",
        boxShadow: "none",
    } as React.CSSProperties,

    resendRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginTop: "20px",
        fontSize: "13px",
        color: "#6b7280",
    } as React.CSSProperties,

    resendBtn: {
        background: "none",
        borderWidth: 0,
        borderStyle: "none",
        color: "#2563eb",
        fontWeight: 600,
        fontSize: "13px",
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: 0,
    } as React.CSSProperties,

    timerText: {
        fontSize: "13px",
        color: "#9ca3af",
        fontWeight: 500,
    } as React.CSSProperties,

    sslBadge: {
        marginTop: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px",
        borderRadius: "10px",
        backgroundColor: "#f0fdf4",
    } as React.CSSProperties,

    sslText: {
        fontSize: "12px",
        fontWeight: 500,
        color: "#16a34a",
    } as React.CSSProperties,

    errorText: {
        fontSize: "12px",
        color: "#ef4444",
        textAlign: "center" as const,
        marginTop: "12px",
    } as React.CSSProperties,
};

const OTP_RESEND_COOLDOWN = 60;



const OtpForm = () => {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [timer, setTimer] = useState(OTP_RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { email } = location.state as { email: string };

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
        console.log("Verifying OTP:", otpValue, "for email:", email);
        try {
            setLoading(true)
            setError(null)
            await OTP({ email, otp: otpValue })
            navigate('/login')
        } catch (err: any) {
            setError(err?.response?.data?.message || "OTP verification failed")
        } finally {
            setLoading(false)
        }
    }

        const handleResend = () => {
            if (!canResend) return;
            setOtp(Array(6).fill(""));
            setTimer(OTP_RESEND_COOLDOWN);
            setCanResend(false);
            setError("");
            inputRefs.current[0]?.focus();
            console.log("Resending OTP to:", email);
        };

        return (
            <div className="auth-card-wrapper">
                <div className="auth-card">
                    <div style={styles.iconWrapper}>
                        <div style={styles.iconCircle}>
                            <MailOpenIcon />
                        </div>
                    </div>

                    <h1 style={styles.title}>Verify your email</h1>
                    <p style={styles.subtitle}>
                        We've sent a 6-digit verification code to{" "}
                        <span style={styles.emailHighlight}>{email}</span>.
                        <br />
                        Enter the code below to continue.
                    </p>

                    <div className="otp-container" onPaste={handlePaste}>
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
                                onFocus={() => setFocusedIndex(index)}
                                onBlur={() => setFocusedIndex(null)}
                                className={`otp-input${digit ? " filled" : ""}${focusedIndex === index ? " focused" : ""}`}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    {error && <p style={styles.errorText}>{error}</p>}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !isComplete}
                        style={{
                            ...styles.verifyBtn,
                            ...(!isComplete ? styles.verifyBtnDisabled : {}),
                        }}
                        onMouseEnter={(e) => {
                            if (isComplete) {
                                e.currentTarget.style.backgroundColor = "#1d4ed8";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.35)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (isComplete) {
                                e.currentTarget.style.backgroundColor = "#2563eb";
                                e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.25)";
                            }
                        }}
                    >
                        Verify &amp; Continue
                    </button>

                    <div style={styles.resendRow}>
                        {canResend ? (
                            <>
                                <span>Didn't receive the code?</span>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    style={styles.resendBtn}
                                >
                                    Resend OTP
                                </button>
                            </>
                        ) : (
                            <>
                                <span>Resend code in</span>
                                <span style={styles.timerText}>{formatTime(timer)}</span>
                            </>
                        )}
                    </div>

                    <div style={styles.sslBadge}>
                        <ShieldCheckIcon />
                        <span style={styles.sslText}>
                            Secure &amp; Encrypted SSL Connection
                        </span>
                    </div>
                </div>
            </div>
        );
   

}
export default OtpForm;