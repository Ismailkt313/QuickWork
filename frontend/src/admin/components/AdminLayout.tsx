import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../admin.css";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-wrapper">
             {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="admin-content">
                 <div className="mobile-header">
                    <button
                        className="mobile-hamburger"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <i className="bi bi-list"></i>
                    </button>
                    <span className="mobile-brand">QuickWork Admin</span>
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
