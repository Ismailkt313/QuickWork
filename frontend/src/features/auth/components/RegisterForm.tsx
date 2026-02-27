import { useState, useMemo } from "react";
import type { RegisterFormProps } from "../types";
import { sendOtp, login } from "../services/authApi"
import { useNavigate } from "react-router-dom";
import "../auth.css";

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const MailIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const LockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#22c55e" />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const styles = {
    wrapper: {
        width: "100%",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "0 16px",
        fontFamily: "'Inter', system-ui, sans-serif",
    } as React.CSSProperties,

    card: {
        backgroundColor: "#ffffff",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
        borderRadius: "16px",
        padding: "40px 36px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
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
    } as React.CSSProperties,

    form: {
        marginTop: "32px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "20px",
    } as React.CSSProperties,

    label: {
        display: "block",
        fontSize: "13px",
        fontWeight: 600,
        color: "#374151",
        marginBottom: "6px",
    } as React.CSSProperties,

    inputGroup: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "12px",
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
        backgroundColor: "#f9fafb",
        transition: "border-color 0.2s, box-shadow 0.2s",
    } as React.CSSProperties,

    input: {
        width: "100%",
        borderWidth: 0,
        borderStyle: "none",
        outline: "none",
        backgroundColor: "transparent",
        fontSize: "14px",
        color: "#111827",
        fontFamily: "'Inter', system-ui, sans-serif",
    } as React.CSSProperties,

    eyeButton: {
        flexShrink: 0,
        cursor: "pointer",
        borderWidth: 0,
        borderStyle: "none",
        background: "transparent",
        padding: 0,
        display: "flex",
        alignItems: "center",
    } as React.CSSProperties,

    strengthBar: (active: boolean, color: string) => ({
        flex: 1,
        height: "4px",
        borderRadius: "4px",
        backgroundColor: active ? color : "#e5e7eb",
        transition: "background-color 0.3s",
    }) as React.CSSProperties,

    hint: {
        fontSize: "12px",
        color: "#9ca3af",
        marginTop: "6px",
    } as React.CSSProperties,

    fieldError: {
        fontSize: "12px",
        color: "#ef4444",
        marginTop: "6px",
        margin: 0,
        marginBlockStart: "6px",
    } as React.CSSProperties,

    termsRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        fontSize: "13px",
        color: "#4b5563",
        lineHeight: 1.5,
        cursor: "pointer",
    } as React.CSSProperties,

    checkbox: {
        marginTop: "3px",
        width: "16px",
        height: "16px",
        accentColor: "#2563eb",
        cursor: "pointer",
        flexShrink: 0,
    } as React.CSSProperties,

    link: {
        color: "#2563eb",
        fontWeight: 500,
        textDecoration: "none",
    } as React.CSSProperties,

    submitBtn: {
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
    } as React.CSSProperties,

    submitBtnDisabled: {
        opacity: 0.5,
        cursor: "not-allowed",
        boxShadow: "none",
    } as React.CSSProperties,

    dividerRow: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        margin: "24px 0",
    } as React.CSSProperties,

    dividerLine: {
        flex: 1,
        height: "1px",
        backgroundColor: "#e5e7eb",
    } as React.CSSProperties,

    dividerText: {
        fontSize: "12px",
        color: "#9ca3af",
        whiteSpace: "nowrap" as const,
    } as React.CSSProperties,

    socialRow: {
        display: "flex",
        gap: "14px",
    } as React.CSSProperties,

    socialBtn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "12px",
        borderRadius: "12px",
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
        fontSize: "14px",
        fontWeight: 500,
        color: "#374151",
        cursor: "pointer",
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: "border-color 0.2s, background-color 0.2s",
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

    apiError: {
        fontSize: "13px",
        color: "#ef4444",
        textAlign: "center" as const,
        padding: "10px 16px",
        backgroundColor: "#fef2f2",
        borderRadius: "8px",
        marginBottom: "4px",
    } as React.CSSProperties,
};

function getPasswordStrength(pw: string): number {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
}

function strengthColor(score: number): string {
    if (score === 1) return "#f87171";
    if (score === 2) return "#fbbf24";
    return "#22c55e";
}


type FieldErrors = {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

function validateFields(
    isSignup: boolean,
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
): FieldErrors {
    const errors: FieldErrors = {};

    if (isSignup && fullName.trim().length === 0) {
        errors.fullName = "Full name is required";
    }

    if (email.trim().length === 0) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Enter a valid email address";
    }

    if (password.length === 0) {
        errors.password = "Password is required";
    } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters";
    }

    if (isSignup) {
        if (confirmPassword.length === 0) {
            errors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
    }

    return errors;
}


const RegisterForm = ({ mode }: RegisterFormProps) => {
    const [fullName, setFullName] = useState("");
    const [email, setemail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>();
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const isLogin = mode === "/login";
    const isSignup = mode === "/signup";

    const strength = useMemo(() => getPasswordStrength(password), [password]);
    const fieldErrors = useMemo(
        () => validateFields(isSignup, fullName, email, password, confirmPassword),
        [isSignup, fullName, email, password, confirmPassword]
    );
    const hasNoErrors = Object.keys(fieldErrors).length === 0;
    const canSubmit = isLogin
        ? hasNoErrors && !loading
        : hasNoErrors && agreedToTerms && !loading;
    const isDisabled = !canSubmit || loading;

    const markTouched = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    const showFieldError = (field: keyof FieldErrors): string | undefined => {
        if (submitted || touched[field]) {
            return fieldErrors[field];
        }
        return undefined;
    };

    const getInputGroupStyle = (field: string): React.CSSProperties => {
        const err = showFieldError(field as keyof FieldErrors);
        return {
            ...styles.inputGroup,
            ...(focusedField === field
                ? { borderColor: "#2563eb", boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)" }
                : {}),
            ...(err
                ? { borderColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)" }
                : {}),
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (!canSubmit) return;
        try {
            setLoading(true);
            setError(null);
            if (isSignup) {
                console.log({ name: fullName, email, password, confirmPassword })
                await sendOtp({ name: fullName, email, password, confirmPassword });
                navigate("/verify-otp", { state: {email} });
            } else {
                const response = await login({ email, password });
                localStorage.setItem("token", response.data.token);
                navigate("/");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card-wrapper" style={styles.wrapper}>
            <div className="auth-card" style={styles.card}>
                <h1 style={styles.title}>
                    {isLogin ? "Welcome back" : "Create your client account"}
                </h1>
                <p style={styles.subtitle}>
                    {isSignup ? "Join thousands of businesses hiring verified experts." : ""}
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {isSignup && (
                        <div>
                            <label htmlFor="fullName" style={styles.label}>Full Name</label>
                            <div
                                style={getInputGroupStyle("fullName")}
                                onFocus={() => setFocusedField("fullName")}
                                onBlur={() => { setFocusedField(null); markTouched("fullName"); }}
                            >
                                <UserIcon />
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="ismail knr"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            {showFieldError("fullName") && (
                                <p style={styles.fieldError}>{showFieldError("fullName")}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" style={styles.label}>Email</label>
                        <div
                            style={getInputGroupStyle("email")}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => { setFocusedField(null); markTouched("email"); }}
                        >
                            <MailIcon />
                            <input
                                id="email"
                                type="text"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setemail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        {showFieldError("email") && (
                            <p style={styles.fieldError}>{showFieldError("email")}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <div
                            style={getInputGroupStyle("password")}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => { setFocusedField(null); markTouched("password"); }}
                        >
                            <LockIcon />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                style={styles.eyeButton}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {showFieldError("password") ? (
                            <p style={styles.fieldError}>{showFieldError("password")}</p>
                        ) : (
                            <>
                                <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            style={styles.strengthBar(
                                                i < strength,
                                                strengthColor(strength)
                                            )}
                                        />
                                    ))}
                                </div>
                                <p style={styles.hint}>
                                    At least 8 characters, a number &amp; symbol.
                                </p>
                            </>
                        )}
                    </div>

                    {isSignup && (
                        <div>
                            <label htmlFor="confirmPassword" style={styles.label}>Verify Password</label>
                            <div
                                style={getInputGroupStyle("confirmPassword")}
                                onFocus={() => setFocusedField("confirmPassword")}
                                onBlur={() => { setFocusedField(null); markTouched("confirmPassword"); }}
                            >
                                <LockIcon />
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={styles.input}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    style={styles.eyeButton}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {showFieldError("confirmPassword") && (
                                <p style={styles.fieldError}>{showFieldError("confirmPassword")}</p>
                            )}
                        </div>
                    )}

                    {isSignup && (
                        <label htmlFor="terms" style={styles.termsRow}>
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={styles.checkbox}
                            />
                            <span>
                                By creating an account, you agree to the{" "}
                                <a href="#" style={styles.link}>Terms of Service</a>{" "}
                                and{" "}
                                <a href="#" style={styles.link}>Privacy Policy</a>.
                            </span>
                        </label>
                    )}

                    {error && <p style={styles.apiError}>{error}</p>}

                    <button
                        type="submit"
                        disabled={isDisabled && submitted}
                        style={{
                            ...styles.submitBtn,
                            ...(isDisabled && submitted ? styles.submitBtnDisabled : {}),
                        }}
                        onMouseEnter={(e) => {
                            if (!isDisabled) {
                                e.currentTarget.style.backgroundColor = "#1d4ed8";
                                e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.35)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isDisabled) {
                                e.currentTarget.style.backgroundColor = "#2563eb";
                                e.currentTarget.style.boxShadow = "0 4px 14px rgba(37, 99, 235, 0.25)";
                            }
                        }}
                    >
                        {loading ? "Processing..." : isSignup ? "Create Account" : "Login"}
                    </button>
                </form>

                <div style={styles.dividerRow}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>{isSignup ? "Or sign up with" : "Or login with"}</span>
                    <div style={styles.dividerLine} />
                </div>

                <div style={styles.socialRow}>
                    <button
                        type="button"
                        style={styles.socialBtn}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#d1d5db";
                            e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.backgroundColor = "#ffffff";
                        }}
                    >
                        <GoogleIcon />
                        Google
                    </button>
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
};

export default RegisterForm;
