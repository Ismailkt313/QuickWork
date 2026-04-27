import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import { api } from "../../../services/api";
import LocationModal from "../landingPage/components/LocationModal";
import { CreateJobModal } from "../jobs/components/CreateJobModal";
import { NotificationModal } from "../../notification/components/NotificationModal";
import { useNotifications } from "../../notification/hooks/useNotifications";
import { FaBell } from "react-icons/fa";
import type { Location } from "../landingPage/services/landingService";

interface HeaderProps {
  locations?: Location[];
  selectedLocation?: Location | null;
  onSelectLocation?: (location: Location) => void;
  onClearLocation?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
  onClearLocation,
}) => {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null,
  );

  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const response = await api.get("/auth/me");
          const result = response.data;
          if (result && result.data) {
            setUser({
              name: result.data.name,
              email: result.data.email,
            });
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          try {
            const decoded: any = jwtDecode(token);
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
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("locationId");
    onClearLocation?.();
    navigate("/auth/login");
  };

  const handleSelect = (loc: Location) => {
    onSelectLocation?.(loc);
    setModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".navbar") &&
        !target.closest(".profile-dropdown-container")
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <>
      <nav
        className="navbar navbar-expand-lg sticky-top"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e8edf5",
          boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
          minHeight: 64,
        }}
      >
        <div className="container">
          <a
            className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
            href="/"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: "#fff",
                fontWeight: 800,
              }}
            >
              Q
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 18,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Quick<span style={{ color: "#3b82f6" }}>Work</span>
            </span>
          </a>

          <button
            className="navbar-toggler border-0"
            type="button"
            onClick={() => setNavOpen(!navOpen)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse${navOpen ? " show" : ""}`}>
            <ul className="navbar-nav mx-auto gap-1">
              {[
                { label: "Browse Services", href: "/user/services" },
                { label: "How it Works", href: "/#how-it-works" },
              ].map((item) => (
                <li className="nav-item" key={item.label}>
                  <a
                    href={item.href}
                    className="nav-link px-3"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#475569",
                      borderRadius: 8,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#1e293b";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#475569";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "transparent";
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="nav-item">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (!token) navigate("/auth/login");
                    else setIsJobModalOpen(true);
                  }}
                  className="nav-link px-3 border-0 bg-transparent w-100 text-start"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#475569",
                    borderRadius: 8,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#1e293b";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#475569";
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                >
                  Create Job
                </button>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 20,
                  cursor: "pointer",
                  border: "1.5px solid",
                  borderColor: selectedLocation ? "#bfdbfe" : "#e2e8f0",
                  background: selectedLocation ? "#eff6ff" : "#f8fafc",
                  fontSize: 13,
                  fontWeight: 600,
                  color: selectedLocation ? "#1d4ed8" : "#64748b",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                <span>📍</span>
                <span
                  style={{
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedLocation?.name ?? "Choose Location"}
                </span>
              </button>

              {token ? (
                <div className="d-flex align-items-center gap-3">
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setIsNotificationOpen(true)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                        display: "flex",
                        alignItems: "center",
                        color: "#64748b",
                        padding: "8px",
                        borderRadius: "50%",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#f1f5f9";
                        (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "none";
                        (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                      }}
                      aria-label="Notifications"
                    >
                      <FaBell />
                    </button>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          width: 18,
                          height: 18,
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 700,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid #fff",
                        }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>

                  <div
                    style={{ position: "relative" }}
                    className="profile-dropdown-container"
                  >
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "26px",
                      display: "flex",
                      alignItems: "center",
                      color: "#475569",
                    }}
                    aria-label="User menu"
                  >
                    <FaUserCircle />
                  </button>
                  {profileOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 45,
                        width: 220,
                        background: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                        overflow: "hidden",
                        zIndex: 1000,
                      }}
                    >
                      <div
                        onClick={() => {
                          navigate("/user/profile");
                          setProfileOpen(false);
                        }}
                        style={{
                          padding: "16px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          borderBottom: "1px solid #f1f5f9",
                          transition: "background 0.15s",
                        }}
                        className="dropdown-identity-header"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f8fafc")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#fff")
                        }
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #3b82f6, #6366f1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {userInitials}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#0f172a",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {user?.name || "QuickWork User"}
                          </span>
                          <span style={{ fontSize: 11, color: "#64748b" }}>
                            View Profile
                          </span>
                        </div>
                      </div>

                      <div style={{ padding: "6px 0" }}>
                        <div
                          onClick={() => {
                            navigate("/user/jobs");
                            setProfileOpen(false);
                          }}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#475569",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f1f5f9";
                            e.currentTarget.style.color = "#0f172a";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#475569";
                          }}
                        >
                          My Jobs
                        </div>

                        <div
                          onClick={() => {
                            navigate("/user/messages");
                            setProfileOpen(false);
                          }}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#475569",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f1f5f9";
                            e.currentTarget.style.color = "#0f172a";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#475569";
                          }}
                        >
                          Messages
                        </div>

                        <div
                          onClick={handleLogout}
                          style={{
                            padding: "10px 16px",
                            cursor: "pointer",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#ef4444",
                            borderTop: "1px solid #f1f5f9",
                            marginTop: 4,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fef2f2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          Logout
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/auth/login")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: "1.5px solid #e2e8f0",
                      background: "#fff",
                      color: "#1e293b",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/auth/signup")}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LocationModal
        isOpen={modalOpen}
        locations={locations}
        selectedLocationId={selectedLocation?._id}
        onSelect={handleSelect}
        onClose={() => setModalOpen(false)}
      />
      <CreateJobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
      />
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notificationsLoading}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </>
  );
};

export default Header;
