import { logout } from "../features/auth/services/authApi";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  let token = localStorage.getItem("token");
  let refreshToken = localStorage.getItem("refreshToken");
  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logout({ refreshToken });
      }
    } catch (err) {
      console.error("Logout API failed:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const handleBecomeProvider = () => {
    navigate("/become-provider");
  };

  return (
    <div className="landing-page d-flex flex-column">
      <nav className="auth-navbar sticky-top py-3">
        <div className="container d-flex align-items-center justify-content-between" style={{ maxWidth: 1100 }}>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
              <span className="text-white fw-bold" style={{ fontSize: 15 }}>Q</span>
            </div>
            <span className="brand-text">QuickWork</span>
          </div>
          {token ? (
            <>
              <button
                onClick={handleBecomeProvider}
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <i className="bi bi-person-plus"></i>
                Become a Service Provider
              </button>
              <button onClick={handleLogout} className="btn btn-logout d-flex align-items-center gap-2">
                <i className="bi bi-box-arrow-right"></i>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} className="btn btn-login d-flex align-items-center gap-2">
              <i className="bi bi-box-arrow-in-right"></i>
              Login
            </button>
          )}
        </div>
      </nav>
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-3 py-5">
        <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary fw-semibold px-3 py-2 mb-4"
          style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <i className="bi bi-circle-fill me-2" style={{ fontSize: '0.375rem', verticalAlign: 'middle' }}></i>
          DASHBOARD COMING SOON
        </span>

        <h1 className="fw-bold mb-3" style={{ fontSize: '2.25rem', letterSpacing: '-0.02em', maxWidth: 480 }}>
          Welcome to{" "}
          <span style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            QuickWork
          </span>
        </h1>
        <p className="text-secondary mb-5" style={{ fontSize: '1.0625rem', maxWidth: 440 }}>
          Your marketplace dashboard is being built. Stay tuned for an amazing experience.
        </p>

        <div className="row g-3 justify-content-center" style={{ maxWidth: 480, width: '100%' }}>
          <div className="col-4">
            <div className="landing-stat-card">
              <div className="fw-bold text-primary" style={{ fontSize: '1.5rem' }}>0</div>
              <div className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>Projects</div>
            </div>
          </div>
          <div className="col-4">
            <div className="landing-stat-card">
              <div className="fw-bold text-success" style={{ fontSize: '1.5rem' }}>0</div>
              <div className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>Messages</div>
            </div>
          </div>
          <div className="col-4">
            <div className="landing-stat-card">
              <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#d97706' }}>$0</div>
              <div className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>Earnings</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-secondary" style={{ fontSize: '0.75rem' }}>
        © QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
