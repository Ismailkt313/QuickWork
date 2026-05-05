import React, { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { RiMenuLine, RiMapPin2Line } from "react-icons/ri";
import { useNavigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../../../services/api";
import { logout } from "../../auth/services/authApi";
import { ENDPOINTS } from "../../../constants/endpoints";
import "../../provider/components/ProviderSidebar.css";

const UserDashboardLayout: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profileImage?: { url: string; public_id: string };
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchProfile = async () => {
        try {
          const response = await api.get(ENDPOINTS.AUTH.ME);
          const result = response.data;
          if (result.success) {
            setUser({
              name: result.data.name,
              email: result.data.email,
              profileImage: result.data.profileImage,
            });
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);

          try {
            const decoded = jwtDecode(token) as { name?: string; email?: string };
            setUser({
              name: decoded.name || "User",
              email: decoded.email || "",
            });
          } catch (e) {
            console.error("Failed to decode token:", e);
          }
        }
      };
      fetchProfile();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <div className="qw-layout">
      <header className="qw-mobile-header">
        <button
          className="qw-hamburger"
          onClick={() => setShowMobileSidebar(true)}
          aria-label="Open navigation"
        >
          <RiMenuLine />
        </button>
        <div className="qw-mobile-brand">
          <RiMapPin2Line className="text-primary me-2" />
          Quick<span>Work</span>
        </div>
      </header>
      <UserSidebar
        showOnMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
        onLogout={handleLogout}
        user={{
          name: user?.name || "User",
          email: user?.email,
          initials: user?.name ? user.name.slice(0, 1).toUpperCase() : "U",
          profileImage: user?.profileImage,
        }}
      />
      <main className="qw-main-content">
        <div className="container-fluid p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserDashboardLayout;
