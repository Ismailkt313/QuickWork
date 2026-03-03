import { Link, useLocation } from "react-router-dom";

const navItems = [
    { label: "Dashboard", icon: "bi-grid-1x2-fill", path: "/admin" },
    { label: "Users", icon: "bi-people-fill", path: "/admin/users" },
    { label: "Skill Requests", icon: "bi-star-fill", path: "/admin/skill-requests" },
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

    const isActive = (path: string) => {
        if (path === "/admin") return location.pathname === "/admin";
        return location.pathname.startsWith(path);
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
                <div className="sidebar-footer-avatar">AD</div>
                <div className="sidebar-footer-info">
                    <div className="sidebar-footer-name">Admin Panel</div>
                    <div className="sidebar-footer-version">v2.4.0-stable</div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
