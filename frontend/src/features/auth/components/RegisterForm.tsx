import { AxiosError } from "axios";
import { useState, useMemo } from "react";
import type { RegisterFormProps } from "../types";
import { sendOtp, login } from "../services/authApi";
import { useNavigate, Link } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;

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
  if (isSignup && fullName.trim().length === 0)
    errors.fullName = "Full name is required";
  if (email.trim().length === 0) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address";
  if (password.length === 0) errors.password = "Password is required";
  else if (isSignup) {
    if (password.length < 6)
      errors.password = "Password must be at least 6 characters";
    else if (!/[A-Z]/.test(password))
      errors.password = "Include at least one uppercase letter";
    else if (!/[0-9]/.test(password))
      errors.password = "Include at least one number";
    else if (!/[^A-Za-z0-9]/.test(password))
      errors.password = "Include at least one special character";
  }
  if (isSignup) {
    if (confirmPassword.length === 0)
      errors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
  }
  return errors;
}

const RegisterForm = ({ mode }: RegisterFormProps) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === "/auth/login";
  const isSignup = mode === "/auth/signup";

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const fieldErrors = useMemo(
    () => validateFields(isSignup, fullName, email, password, confirmPassword),
    [isSignup, fullName, email, password, confirmPassword],
  );
  const hasNoErrors = Object.keys(fieldErrors).length === 0;
  const canSubmit = isLogin
    ? hasNoErrors && !loading
    : hasNoErrors && agreedToTerms && !loading;
  const isDisabled = !canSubmit || loading;

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const showFieldError = (field: keyof FieldErrors): string | undefined => {
    if (submitted || touched[field]) return fieldErrors[field];
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    try {
      setLoading(true);
      setError(null);
      if (isSignup) {
        await sendOtp({ name: fullName, email, password, confirmPassword });
        navigate("/auth/verify-otp", { state: { email } });
      } else {
        const response = await login({ email, password });
        localStorage.setItem("token", response.data.accessToken);
        navigate("/");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      console.error("Authentication error:", axiosError);
      setError(axiosError.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="text-center mb-4">
        <h1 className="auth-card-title">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="auth-card-subtitle">
          {isLogin
            ? "Sign in to access your dashboard"
            : "Join thousands of businesses hiring verified experts"}
        </p>
      </div>

      <button
        type="button"
        className="btn auth-btn-google w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={() => (window.location.href = `${apiUrl}/api/v1/auth/google`)}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        Continue with Google
      </button>

      <div className="auth-divider">
        <hr />
        <span>or continue with email</span>
        <hr />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {isSignup && (
          <div className="mb-3">
            <label htmlFor="fullName" className="auth-label">
              Full Name
            </label>
            <div className="auth-input-group">
              <i className="bi bi-person auth-input-icon"></i>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => markTouched("fullName")}
                className={`form-control ${showFieldError("fullName") ? "is-invalid" : ""}`}
              />
            </div>
            {showFieldError("fullName") && (
              <div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>
                {showFieldError("fullName")}
              </div>
            )}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="email" className="auth-label">
            Email address
          </label>
          <div className="auth-input-group">
            <i className="bi bi-envelope auth-input-icon"></i>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched("email")}
              className={`form-control ${showFieldError("email") ? "is-invalid" : ""}`}
            />
          </div>
          {showFieldError("email") && (
            <div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>
              {showFieldError("email")}
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <label htmlFor="password" className="auth-label mb-0">
              Password
            </label>
            {isLogin && (
              <Link
                to="/auth/forgot-password"
                title="Forgot password"
                className="auth-link"
                style={{ fontSize: "0.75rem" }}
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="auth-input-group">
            <i className="bi bi-lock auth-input-icon"></i>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched("password")}
              className={`form-control ${showFieldError("password") ? "is-invalid" : ""}`}
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
          {showFieldError("password") ? (
            <div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>
              {showFieldError("password")}
            </div>
          ) : isSignup && password.length > 0 ? (
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
                  Use 6+ chars, uppercase, number & symbol
                </small>
                {strength > 0 && (
                  <small
                    className={`fw-semibold ${strengthTextClass(strength)}`}
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {strengthLabel(strength)}
                  </small>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {isSignup && (
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirm Password
            </label>
            <div className="auth-input-group">
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => markTouched("confirmPassword")}
                className={`form-control ${showFieldError("confirmPassword") ? "is-invalid" : ""}`}
                style={{ paddingRight: "2.75rem" }}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirmPassword((v) => !v)}
              >
                <i
                  className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                ></i>
              </button>
            </div>
            {showFieldError("confirmPassword") && (
              <div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>
                {showFieldError("confirmPassword")}
              </div>
            )}
          </div>
        )}

        {isSignup && (
          <div className="mb-3 d-flex align-items-start gap-2">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="auth-checkbox mt-1"
            />
            <label
              htmlFor="terms"
              className="text-secondary"
              style={{
                fontSize: "0.8125rem",
                cursor: "pointer",
                lineHeight: 1.5,
              }}
            >
              I agree to the{" "}
              <a href="#" className="auth-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="auth-link">
                Privacy Policy
              </a>
            </label>
          </div>
        )}

        {error && (
          <div className="auth-error d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-circle"></i>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isDisabled && submitted}
          className="btn auth-btn-primary w-100 mt-1"
        >
          {loading ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Processing...
            </span>
          ) : isSignup ? (
            "Create Account"
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="auth-ssl-badge">
        <i className="bi bi-shield-check text-success"></i>
        <span>256-bit SSL Encrypted Connection</span>
      </div>
    </div>
  );
};

export default RegisterForm;
