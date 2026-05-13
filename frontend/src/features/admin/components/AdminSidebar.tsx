import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminLogout } from "../services/adminApi";
import { toast } from "react-toastify";

const navItems = [
  { label: "Dashboard", icon: "bi-grid-1x2-fill", path: "/admin" },
  { label: "Users", icon: "bi-people-fill", path: "/admin/users" },
  { label: "Jobs", icon: "bi-briefcase-fill", path: "/admin/jobs" },
  {
    label: "Providers",
    icon: "bi-person-badge-fill",
    path: "/admin/providers",
  },
  {
    label: "Skill Requests",
    icon: "bi-star-fill",
    path: "/admin/skill-requests",
  },
  {
    label: "Skill Directory",
    icon: "bi-card-list",
    path: "/admin/skills",
  },
  { label: "Transactions", icon: "bi-receipt", path: "/admin/transactions" },
  { label: "Reports", icon: "bi-file-earmark-text", path: "/admin/reports" },
  { label: "Settings", icon: "bi-gear", path: "/admin/settings" },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API fails, we should clear local state
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      navigate("/admin/login");
    }
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="sidebar-brand-title">QuickWork Admin</div>
            <div className="sidebar-brand-subtitle">Platform Safety</div>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-link ${isActive(item.path) ? "active" : ""}`}
            onClick={onClose}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-2">
                <div className="sidebar-footer-avatar">AD</div>
                <div className="sidebar-footer-info">
                <div className="sidebar-footer-name">Admin Panel</div>
                <div className="sidebar-footer-version">v2.4.0-stable</div>
                </div>
            </div>
            <button 
                className="btn btn-sm text-danger hover:bg-red-50 p-2 rounded-lg transition-colors"
                onClick={handleLogout}
                title="Logout"
            >
                <i className="bi bi-box-arrow-right" style={{ fontSize: '1.25rem' }}></i>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
