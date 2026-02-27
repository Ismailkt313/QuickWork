import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminApi";
import "../../features/auth/auth.css";

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

const ShieldCheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#22c55e" />
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const styles = {
    headerWrapper: {
        textAlign: "center" as const,
        marginBottom: "32px",
    } as React.CSSProperties,

    iconWrapper: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "16px",
    } as React.CSSProperties,

    iconCircle: {
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        backgroundColor: "#2563eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
    } as React.CSSProperties,

    title: {
        fontSize: "24px",
        fontWeight: 700,
        color: "#111827",
        margin: 0,
        lineHeight: 1.3,
    } as React.CSSProperties,

    subtitle: {
        fontSize: "14px",
        color: "#6b7280",
        marginTop: "8px",
        marginBottom: 0,
    } as React.CSSProperties,

    form: {
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

    apiError: {
        fontSize: "13px",
        color: "#ef4444",
        textAlign: "center" as const,
        padding: "10px 16px",
        backgroundColor: "#fef2f2",
        borderRadius: "8px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#fecaca",
        marginBottom: "4px",
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

    fieldError: {
        fontSize: "12px",
        color: "#ef4444",
        marginTop: "6px",
        margin: 0,
        marginBlockStart: "6px",
    } as React.CSSProperties,

    adminBadge: {
        display: "inline-block",
        fontSize: "11px",
        fontWeight: 600,
        color: "#ffffff",
        backgroundColor: "#1e293b",
        padding: "2px 8px",
        borderRadius: "6px",
        letterSpacing: "0.05em",
        textTransform: "uppercase" as const,
    } as React.CSSProperties,

    spinnerWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
    } as React.CSSProperties,
};

type FieldErrors = {
    email?: string;
    password?: string;
};

function validateFields(email: string, password: string): FieldErrors {
    const errors: FieldErrors = {};

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

    return errors;
}

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const fieldErrors = useMemo(() => validateFields(email, password), [email, password]);
    const hasNoErrors = Object.keys(fieldErrors).length === 0;
    const isDisabled = !hasNoErrors || loading;

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
        if (!hasNoErrors) return;
        try {
            setLoading(true);
            setApiError(null);
            const response = await adminLogin({ email, password });
            localStorage.setItem("adminAccessToken", response.data.accessToken);
            localStorage.setItem("adminRefreshToken", response.data.refreshToken);
            navigate("/admin/dashboard");
        } catch (err: any) {
            setApiError(err?.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <nav className="auth-navbar">
                <div className="auth-navbar-inner">
                    <a href="/" className="auth-navbar-logo" style={{ textDecoration: "none" }}>
                        <span className="auth-navbar-logo-text">QuickWork</span>
                        <span style={styles.adminBadge}>Admin</span>
                    </a>
                </div>
            </nav>

            <main className="auth-main">
                <div className="auth-card-wrapper" style={{ maxWidth: "440px" }}>
                    <div className="auth-card">
                        <div style={styles.headerWrapper}>
                            <div style={styles.iconWrapper}>
                                <div style={styles.iconCircle}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>
                            </div>
                            <h1 style={styles.title}>Admin Portal</h1>
                            <p style={styles.subtitle}>Sign in to manage your platform</p>
                        </div>

                        {apiError && (
                            <div style={styles.apiError}>{apiError}</div>
                        )}

                        <form onSubmit={handleSubmit} noValidate style={styles.form}>
                            <div>
                                <label htmlFor="admin-email" style={styles.label}>Email</label>
                                <div
                                    style={getInputGroupStyle("email")}
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => { setFocusedField(null); markTouched("email"); }}
                                >
                                    <MailIcon />
                                    <input
                                        id="admin-email"
                                        type="email"
                                        placeholder="admin@quickwork.com"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                {showFieldError("email") && (
                                    <p style={styles.fieldError}>{showFieldError("email")}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="admin-password" style={styles.label}>Password</label>
                                <div
                                    style={getInputGroupStyle("password")}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => { setFocusedField(null); markTouched("password"); }}
                                >
                                    <LockIcon />
                                    <input
                                        id="admin-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
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
                                {showFieldError("password") && (
                                    <p style={styles.fieldError}>{showFieldError("password")}</p>
                                )}
                            </div>

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
                                {loading ? "Processing..." : "Sign In"}
                            </button>
                        </form>

                        <div style={styles.sslBadge}>
                            <ShieldCheckIcon />
                            <span style={styles.sslText}>
                                Secure &amp; Encrypted SSL Connection
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="auth-footer">
                © QuickWork Marketplace Inc. All rights reserved.
            </footer>
        </div>
    );
};

export default AdminLogin;
