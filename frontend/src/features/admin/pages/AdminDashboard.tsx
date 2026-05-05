import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/services/authApi";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    navigate("/admin/login");
  };

  return (
    <div>
      <div className="admin-breadcrumb">
        Admin <span className="separator">›</span> <span>Dashboard</span>
      </div>

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Manage your platform, users, and services from here.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-logout d-flex align-items-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </div>
      <div className="admin-stats-row" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Users</div>
          <div className="admin-stat-value blue">
            <i
              className="bi bi-people"
              style={{ fontSize: "1.25rem", marginRight: 8 }}
            ></i>
            0
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Providers</div>
          <div className="admin-stat-value" style={{ color: "#16a34a" }}>
            <i
              className="bi bi-briefcase"
              style={{ fontSize: "1.25rem", marginRight: 8 }}
            ></i>
            0
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Revenue</div>
          <div className="admin-stat-value orange">
            <i
              className="bi bi-currency-dollar"
              style={{ fontSize: "1.25rem", marginRight: 8 }}
            ></i>
            $0
          </div>
        </div>
      </div>

      <div
        className="admin-table-card"
        style={{ padding: "3rem 2rem", textAlign: "center" }}
      >
        <i
          className="bi bi-speedometer2 d-block mb-3"
          style={{ fontSize: "2.5rem", color: "#cbd5e1" }}
        ></i>
        <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
          Dashboard analytics coming soon. Use the sidebar to manage users and
          platform settings.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
