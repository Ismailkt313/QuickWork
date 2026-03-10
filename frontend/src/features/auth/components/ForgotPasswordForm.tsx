import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authApi";

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email is required");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await forgotPassword({ email });
            setSubmitted(true);
            setTimeout(() => {
                navigate("/auth/reset-password", { state: { email } });
            }, 2000);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', backgroundColor: '#eff6ff' }}>
                    <i className="bi bi-key" style={{ fontSize: '2rem', color: '#2563eb' }}></i>
                </div>
                <h1 className="auth-card-title">Forgot password?</h1>
                <p className="auth-card-subtitle">
                    No worries, we'll send you reset instructions.
                </p>
            </div>

            {submitted ? (
                <div className="text-center">
                    <div className="auth-ssl-badge mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '1.25rem' }}></i>
                        <span className="ms-2 fw-semibold text-success">Instructions sent!</span>
                    </div>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.875rem' }}>
                        We've sent a 6-digit code to <br />
                        <span className="fw-semibold text-dark">{email}</span>
                    </p>
                    <p className="text-secondary mt-3" style={{ fontSize: '0.75rem' }}>
                        Redirecting you to reset page...
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="auth-label">Email address</label>
                        <div className="auth-input-group">
                            <i className="bi bi-envelope auth-input-icon"></i>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`form-control ${error ? "is-invalid" : ""}`}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <div className="text-danger mt-1" style={{ fontSize: '0.75rem' }}>{error}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn auth-btn-primary w-100 mb-3"
                    >
                        {loading ? (
                            <span className="d-flex align-items-center justify-content-center gap-2">
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Sending...
                            </span>
                        ) : "Send Reset Code"}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/auth/login")}
                            className="auth-link p-0 border-0 bg-transparent fw-semibold"
                            style={{ fontSize: '0.875rem' }}
                        >
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to login
                        </button>
                    </div>
                </form>
            )}

            <div className="auth-ssl-badge mt-4">
                <i className="bi bi-shield-check text-success"></i>
                <span>Secure Password Reset Protocol</span>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
