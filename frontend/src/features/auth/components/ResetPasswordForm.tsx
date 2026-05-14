import { AxiosError } from "axios";
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../services/authApi";

function getPasswordStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function strengthLabel(score: number): string {
  if (score <= 2) return "Weak";
  if (score === 3) return "Medium";
  if (score === 4) return "Strong";
  return "";
}

function strengthBarClass(score: number): string {
  if (score <= 2) return "strength-weak";
  if (score === 3) return "strength-medium";
  return "strength-strong";
}

function strengthTextClass(score: number): string {
  if (score <= 2) return "text-danger";
  if (score === 3) return "text-warning";
  return "text-success";
}

const OTP_EXPIRY_SECONDS = 120;

const ResetPasswordForm = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expiryTimer, setExpiryTimer] = useState(OTP_EXPIRY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as { email?: string } | null;
  const email = locationState?.email || "";

  const strength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  useEffect(() => {
    if (expiryTimer <= 0) {
      setIsExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setExpiryTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTimer]);

  const formatExpiryTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError("Include at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError("Include at least one number");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Include at least one special character");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPassword({ email, otp: otpValue, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          "Reset failed. Please verify your code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="auth-card text-center">
        <h1 className="auth-card-title">Invalid Request</h1>
        <p className="auth-card-subtitle mb-4">
          No email address provided for reset.
        </p>
        <button
          onClick={() => navigate("/auth/forgot-password")}
          className="btn auth-btn-primary w-100"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="text-center mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
          style={{ width: "80px", height: "80px", backgroundColor: "#f0fdf4" }}
        >
          <i
            className="bi bi-shield-lock"
            style={{ fontSize: "2rem", color: "#10b981" }}
          ></i>
        </div>
        <h1 className="auth-card-title">Reset password</h1>
        <p className="auth-card-subtitle">
          Enter the code sent to{" "}
          <span className="fw-semibold text-dark">{email}</span> and your new
          password.
        </p>
      </div>

      {success ? (
        <div className="text-center py-2">
          <div
            className="auth-ssl-badge mb-4"
            style={{ background: "rgba(16, 185, 129, 0.1)" }}
          >
            <i
              className="bi bi-check-circle-fill text-success"
              style={{ fontSize: "1.25rem" }}
            ></i>
            <span className="ms-2 fw-semibold text-success">
              Password reset successfully!
            </span>
          </div>
          <p className="text-secondary mt-3" style={{ fontSize: "0.875rem" }}>
            Redirecting you to login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="auth-label text-center d-block">
              Verification Code
            </label>
            <div className="otp-input-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`otp-input ${digit ? "is-filled" : ""}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <div
            className="mb-4"
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              background: isExpired ? "#fef2f2" : "#f0f9ff",
              border: `1px solid ${isExpired ? "#fecaca" : "#bae6fd"}`,
              textAlign: "center" as const,
              transition: "all 0.3s ease",
            }}
          >
            {isExpired ? (
              <span style={{ fontSize: "0.8125rem", color: "#dc2626", fontWeight: 600 }}>
                ⚠ Code expired — please request a new reset code
              </span>
            ) : (
              <span style={{ fontSize: "0.8125rem", color: "#0369a1", fontWeight: 500 }}>
                Code expires in{" "}
                <span style={{ fontWeight: 700, color: expiryTimer <= 30 ? "#dc2626" : "#0369a1" }}>
                  {formatExpiryTime(expiryTimer)}
                </span>
              </span>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="newPassword" className="auth-label">
              New Password
            </label>
            <div className="auth-input-group">
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
              >
                <i
                  className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="d-flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex-grow-1 strength-bar rounded-pill ${i < strength ? strengthBarClass(strength) : "strength-empty"}`}
                    />
                  ))}
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <small
                    className="text-secondary"
                    style={{ fontSize: "0.6875rem" }}
                  >
                    Strength:{" "}
                    <span className={strengthTextClass(strength)}>
                      {strengthLabel(strength)}
                    </span>
                  </small>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm New Password
            </label>
            <div className="auth-input-group">
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          {error && (
            <div className="auth-error d-flex align-items-center gap-2 mb-4">
              <i className="bi bi-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn auth-btn-primary w-100"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
