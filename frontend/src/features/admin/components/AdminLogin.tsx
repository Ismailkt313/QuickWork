import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminApi";
import axios from "axios";

type FieldErrors = {
  email?: string;
  password?: string;
};

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (email.trim().length === 0) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address";
  if (password.length === 0) errors.password = "Password is required";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters";
  return errors;
}

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const fieldErrors = useMemo(
    () => validateFields(email, password),
    [email, password],
  );
  const hasNoErrors = Object.keys(fieldErrors).length === 0;
  const isDisabled = !hasNoErrors || loading;

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const showFieldError = (field: keyof FieldErrors): string | undefined => {
    if (submitted || touched[field]) return fieldErrors[field];
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!hasNoErrors) return;
    try {
      setLoading(true);
      setApiError(null);
      const response = await adminLogin({ email, password });
      console.log("Admin Login Response:", response.data.data);
      localStorage.setItem("adminAccessToken", response.data.data.accessToken);
      localStorage.setItem(
        "adminRefreshToken",
        response.data.data.refreshToken,
      );
      navigate("/admin");
    } catch (err) {
      let msg = "Invalid credentials";
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <nav className="auth-navbar sticky-top py-3">
        <div
          className="container d-flex align-items-center justify-content-between"
          style={{ maxWidth: 1100 }}
        >
          <a
            href="/"
            className="d-flex align-items-center gap-2 text-decoration-none"
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              }}
            >
              <span className="text-white fw-bold" style={{ fontSize: 15 }}>
                Q
              </span>
            </div>
            <span className="brand-text">QuickWork</span>
            <span className="admin-badge ms-1">Admin</span>
          </a>
        </div>
      </nav>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <div className="auth-card">
          <div className="text-center mb-4">
            <div className="d-flex justify-content-center mb-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 52,
                  height: 52,
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.25)",
                }}
              >
                <i
                  className="bi bi-shield-lock text-white"
                  style={{ fontSize: "1.375rem" }}
                ></i>
              </div>
            </div>
            <h1 className="auth-card-title">Admin Portal</h1>
            <p className="auth-card-subtitle">
              Sign in to manage your platform
            </p>
          </div>

          {apiError && (
            <div className="auth-error d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-circle"></i>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="admin-email" className="auth-label">
                Email
              </label>
              <div className="auth-input-group">
                <i className="bi bi-envelope auth-input-icon"></i>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@quickwork.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                  className={`form-control ${showFieldError("email") ? "is-invalid" : ""}`}
                />
              </div>
              {showFieldError("email") && (
                <div
                  className="text-danger mt-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  {showFieldError("email")}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="admin-password" className="auth-label">
                Password
              </label>
              <div className="auth-input-group">
                <i className="bi bi-lock auth-input-icon"></i>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
              {showFieldError("password") && (
                <div
                  className="text-danger mt-1"
                  style={{ fontSize: "0.75rem" }}
                >
                  {showFieldError("password")}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isDisabled && submitted}
              className="btn auth-btn-primary w-100"
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
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-ssl-badge">
            <i className="bi bi-shield-check text-success"></i>
            <span>Secure & Encrypted SSL Connection</span>
          </div>
        </div>
      </main>

      <footer
        className="text-center py-4 text-secondary"
        style={{ fontSize: "0.75rem" }}
      >
        © QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default AdminLogin;
