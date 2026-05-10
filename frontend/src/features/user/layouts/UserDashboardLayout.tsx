import React, { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { RiMenuLine, RiMapPin2Line } from "react-icons/ri";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { api } from "../../../services/api";
import { logout } from "../../auth/services/authApi";
import { ENDPOINTS } from "../../../constants/endpoints";
import "../../provider/components/ProviderSidebar.css";
import MobileBottomNav from "../components/MobileBottomNav";

const UserDashboardLayout: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    profileImage?: { url: string; public_id: string };
  } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll Lock Management
  useEffect(() => {
    if (showMobileSidebar) {
      document.body.classList.add("qw-sidebar-open");
    } else {
      document.body.classList.remove("qw-sidebar-open");
    }
    return () => document.body.classList.remove("qw-sidebar-open");
  }, [showMobileSidebar]);

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

  useEffect(() => {
    const handleToggle = () => setShowMobileSidebar(true);
    window.addEventListener("qw-toggle-sidebar", handleToggle);
    return () => window.removeEventListener("qw-toggle-sidebar", handleToggle);
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMessaging = location.pathname.includes("/messages");
  const hasActiveChat = new URLSearchParams(location.search).get("userId") ||
    new URLSearchParams(location.search).get("conversationId") ||
    new URLSearchParams(location.search).get("id");

  // Granular visibility logic
  // Hide global header on all messaging pages to allow module-specific headers
  const shouldHideGlobalHeader = isMobile && isMessaging;
  
  // Keep bottom nav visible everywhere except active chat to maximize viewport
  const shouldHideBottomNav = isMobile && isMessaging && hasActiveChat;

  return (
    <div className={`qw-layout ${shouldHideGlobalHeader ? 'has-custom-header' : ''}`}>
      {/* Mobile Header Shell */}
      {!shouldHideGlobalHeader && (
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
      )}

      {/* Sidebar Shell */}
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

      {/* Main Content Shell */}
      <main
        className="qw-main-content"
        style={{
          paddingTop: shouldHideGlobalHeader ? 0 : undefined,
          paddingBottom: shouldHideBottomNav ? 0 : undefined
        }}
      >
        <div className="container-fluid p-0 h-100">
          <Outlet />
        </div>
      </main>

      {/* Persistent Bottom Nav Shell */}
      {!shouldHideBottomNav && <MobileBottomNav />}
    </div>
  );
};

export default UserDashboardLayout;
