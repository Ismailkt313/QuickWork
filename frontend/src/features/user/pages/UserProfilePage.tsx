import React, { useState, useEffect } from "react";
import {
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiShieldLine,
  RiEditLine,
  RiTimeLine,
  RiMailSendLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import { getMe } from "../../auth/services/authApi";
import UpdateProfileModal from "../components/UpdateProfileModal";
import UpdatePasswordModal from "../components/UpdatePasswordModal";
import UpdateEmailModal from "../components/UpdateEmailModal";
import { format } from "date-fns";
import { toast } from "react-toastify";

interface IUser {
  id: string;
  name: string;
  email: string;
  number?: string;
  role: string;
  createdAt: string;
  profileImage?: {
    url: string;
    public_id: string;
  };
  hasPassword?: boolean;
  authProvider?: string;
}

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [isUpdateEmailOpen, setIsUpdateEmailOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-5">
        <h3>User not found</h3>
      </div>
    );
  }

  const userInitials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const MobileProfileLayout = () => (
    <div className="mobile-profile-container animate-fade-in">
      <div className="m-profile-header">
        <div className="m-p-header-main">
          <div className="m-p-avatar-wrap">
            {user.profileImage ? (
              <img src={user.profileImage.url} alt={user.name} />
            ) : (
              <div className="m-p-initials">{userInitials}</div>
            )}
            <button
              className="m-p-edit-badge"
              onClick={() => setIsUpdateProfileOpen(true)}
            >
              <RiEditLine size={14} />
            </button>
          </div>
          <div className="m-p-header-info">
            <h1 className="m-p-name">{user.name}</h1>
            <div className="m-p-badges">
              <span className="m-p-role-tag">{user.role}</span>
              <span className="m-p-status-tag">Verified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="m-info-grid">
        <div className="m-info-card">
          <div className="m-info-icon"><RiMailLine /></div>
          <div className="m-info-content">
            <span className="m-info-label">Email Address</span>
            <span className="m-info-value">{user.email}</span>
          </div>
        </div>
        <div className="m-info-card">
          <div className="m-info-icon"><RiPhoneLine /></div>
          <div className="m-info-content">
            <span className="m-info-label">Phone Number</span>
            <span className="m-info-value">{user.number || "Not provided"}</span>
          </div>
        </div>
        <div className="m-info-card joined">
          <div className="m-info-icon"><RiTimeLine /></div>
          <div className="m-info-content">
            <span className="m-info-label">Member Since</span>
            <span className="m-info-value">{format(new Date(user.createdAt), "MMMM yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="m-action-section">
        <h3 className="m-section-title">Account Settings</h3>
        <div className="m-action-list">
          <button className="m-action-item" onClick={() => setIsUpdateProfileOpen(true)}>
            <div className="m-ai-icon"><RiUser3Line /></div>
            <div className="m-ai-text">
              <span className="m-ai-title">Personal Details</span>
              <span className="m-ai-sub">Name, phone, and profile info</span>
            </div>
            <RiArrowRightSLine className="m-ai-arrow" />
          </button>
          <button className="m-action-item" onClick={() => setIsUpdateEmailOpen(true)}>
            <div className="m-ai-icon" style={{ background: "#faf5ff", color: "#8b5cf6" }}>
              <RiMailSendLine />
            </div>
            <div className="m-ai-text">
              <span className="m-ai-title">Change Email</span>
              <span className="m-ai-sub">Update with OTP verification</span>
            </div>
            <RiArrowRightSLine className="m-ai-arrow" />
          </button>
          <button className="m-action-item" onClick={() => setIsUpdatePasswordOpen(true)}>
            <div className="m-ai-icon"><RiShieldLine /></div>
            <div className="m-ai-text">
              <span className="m-ai-title">Login & Security</span>
              <span className="m-ai-sub">{user.hasPassword === false ? "Set a password" : "Manage password and safety"}</span>
            </div>
            <RiArrowRightSLine className="m-ai-arrow" />
          </button>
        </div>
      </div>

      <style>{`
        .mobile-profile-container {
          padding: 16px;
          background: #f8fafc;
          min-height: calc(100vh - 120px);
          padding-bottom: 100px;
        }
        .m-profile-header {
          background: white;
          border-radius: 24px;
          padding: 20px;
          margin-bottom: 16px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        }
        .m-p-header-main {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .m-p-avatar-wrap {
          position: relative;
          width: 72px;
          height: 72px;
          flex-shrink: 0;
        }
        .m-p-avatar-wrap img, .m-p-initials {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          object-fit: cover;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 800;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
        }
        .m-p-edit-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 28px;
          height: 28px;
          background: white;
          border: 2px solid #f8fafc;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .m-p-name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .m-p-badges {
          display: flex;
          gap: 6px;
          margin-top: 6px;
        }
        .m-p-role-tag {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          background: #eff6ff;
          color: #3b82f6;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .m-p-status-tag {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          background: #f0fdf4;
          color: #16a34a;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .m-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        .m-info-card {
          background: white;
          padding: 14px 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #f1f5f9;
        }
        .m-info-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .m-info-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .m-info-value {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        .m-section-title {
          font-size: 13px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          padding-left: 4px;
        }
        .m-action-list {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }
        .m-action-item {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 16px;
          gap: 16px;
          background: transparent;
          border: none;
          border-bottom: 1px solid #f1f5f9;
          text-align: left;
          transition: background 0.2s;
        }
        .m-action-item:last-child { border: none; }
        .m-action-item:active { background: #f8fafc; }
        .m-ai-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #eff6ff;
          color: #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .m-ai-text { flex: 1; }
        .m-ai-title {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        .m-ai-sub {
          display: block;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 1px;
        }
        .m-ai-arrow {
          color: #cbd5e1;
          font-size: 20px;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <MobileProfileLayout />
      ) : (
        <div
          className="container-fluid py-4 animate-fade-in"
          style={{ maxWidth: "960px" }}
        >
          <div className="mb-4">
            <h1 style={{
              fontSize: 26, fontWeight: 800, color: "#0f172a",
              margin: 0, letterSpacing: "-0.02em",
            }}>
              My Profile
            </h1>
            <p style={{
              color: "#64748b", fontSize: 14, margin: "4px 0 0",
              fontWeight: 500,
            }}>
              Manage your personal information and security settings
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div style={{
                background: "#fff", borderRadius: 20,
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
                overflow: "hidden",
              }}>
                <div style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  padding: "32px 24px", textAlign: "center" as const,
                }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: 24,
                    background: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", margin: "0 auto 16px",
                    border: "3px solid rgba(255,255,255,0.2)",
                    overflow: "hidden", backdropFilter: "blur(4px)",
                    fontSize: 32, fontWeight: 800, color: "#fff",
                  }}>
                    {user.profileImage ? (
                      <img
                        src={user.profileImage.url}
                        alt="Profile"
                        style={{
                          width: "100%", height: "100%",
                          objectFit: "cover" as const,
                        }}
                      />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <h4 style={{
                    color: "#fff", fontWeight: 800, fontSize: 20,
                    margin: "0 0 8px", letterSpacing: "-0.01em",
                  }}>
                    {user.name}
                  </h4>
                  <span style={{
                    display: "inline-block", background: "rgba(255,255,255,0.2)",
                    color: "#fff", padding: "4px 14px", borderRadius: 20,
                    fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const,
                    letterSpacing: "0.06em", backdropFilter: "blur(4px)",
                  }}>
                    {user.role}
                  </span>
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    marginBottom: 20, color: "#64748b", fontSize: 13,
                    fontWeight: 500,
                  }}>
                    <RiTimeLine />
                    <span>Joined {format(new Date(user.createdAt), "MMMM yyyy")}</span>
                  </div>
                  <button
                    onClick={() => setIsUpdateProfileOpen(true)}
                    style={{
                      width: "100%", height: 46, borderRadius: 14,
                      border: "none",
                      background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                      color: "#fff", fontWeight: 700, fontSize: 14,
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      gap: 8, transition: "all 0.2s",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "translateY(-1px)"; (e.target as HTMLElement).style.boxShadow = "0 6px 16px rgba(59,130,246,0.35)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "translateY(0)"; (e.target as HTMLElement).style.boxShadow = "0 4px 12px rgba(59,130,246,0.25)"; }}
                  >
                    <RiEditLine size={16} />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-8">
              <div style={{
                background: "#fff", borderRadius: 20,
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
                marginBottom: 20, overflow: "hidden",
              }}>
                <div style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "#eff6ff", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#3b82f6",
                  }}>
                    <RiUser3Line size={16} />
                  </div>
                  <h5 style={{
                    margin: 0, fontWeight: 800, fontSize: 16,
                    color: "#0f172a", letterSpacing: "-0.01em",
                  }}>
                    Personal Information
                  </h5>
                </div>
                <div style={{ padding: 24 }}>
                  <div className="row g-4">
                    {[
                      { label: "Full Name", value: user.name, icon: null },
                      {
                        label: "Email Address",
                        value: user.email,
                        icon: <RiMailLine size={14} style={{ color: "#64748b" }} />,
                        action: (
                          <button
                            onClick={() => setIsUpdateEmailOpen(true)}
                            style={{
                              background: "#faf5ff", border: "1px solid #ede9fe",
                              borderRadius: 8, padding: "4px 10px",
                              fontSize: 11, fontWeight: 700, color: "#8b5cf6",
                              cursor: "pointer", transition: "all 0.2s",
                              display: "flex", alignItems: "center", gap: 4,
                              whiteSpace: "nowrap" as const,
                            }}
                            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "#8b5cf6"; (e.target as HTMLElement).style.color = "#fff"; }}
                            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "#faf5ff"; (e.target as HTMLElement).style.color = "#8b5cf6"; }}
                          >
                            <RiMailSendLine size={12} />
                            Change
                          </button>
                        ),
                      },
                      {
                        label: "Phone Number",
                        value: user.number || "Not provided",
                        icon: <RiPhoneLine size={14} style={{ color: "#64748b" }} />,
                      },
                      {
                        label: "Account Type",
                        value: `${user.role} Account`,
                        icon: null,
                        capitalize: true,
                      },
                    ].map((field, i) => (
                      <div className="col-12 col-md-6" key={i}>
                        <div style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between", marginBottom: 8,
                        }}>
                          <label style={{
                            fontSize: 11, fontWeight: 700, color: "#94a3b8",
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.04em",
                          }}>
                            {field.label}
                          </label>
                          {field.action}
                        </div>
                        <div style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "12px 14px", borderRadius: 12,
                          background: "#f8fafc",
                          borderLeft: "3px solid #3b82f6",
                          fontSize: 14, fontWeight: 600, color: "#0f172a",
                          textTransform: field.capitalize ? "capitalize" as const : "none" as const,
                          overflow: "hidden",
                        }}>
                          {field.icon}
                          <span style={{
                            overflow: "hidden", textOverflow: "ellipsis",
                            whiteSpace: "nowrap" as const,
                          }}>
                            {field.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                background: "#fff", borderRadius: 20,
                border: "1px solid #f1f5f9",
                boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
                overflow: "hidden",
              }}>
                <div style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "#fef2f2", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#ef4444",
                  }}>
                    <RiShieldLine size={16} />
                  </div>
                  <h5 style={{
                    margin: 0, fontWeight: 800, fontSize: 16,
                    color: "#0f172a", letterSpacing: "-0.01em",
                  }}>
                    Security Settings
                  </h5>
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 16,
                    flexWrap: "wrap" as const,
                  }}>
                    <div>
                      <h6 style={{
                        fontWeight: 700, fontSize: 15, color: "#0f172a",
                        margin: "0 0 4px",
                      }}>
                        Account Password
                      </h6>
                      <p style={{
                        color: "#64748b", fontSize: 13, margin: 0,
                        fontWeight: 500,
                      }}>
                        {user.hasPassword === false
                          ? "You signed in with Google. Set a password to also allow email login."
                          : "It's a good idea to use a strong password that you're not using elsewhere"}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsUpdatePasswordOpen(true)}
                      style={{
                        height: 40, borderRadius: 12, padding: "0 20px",
                        border: "1.5px solid #e2e8f0", background: "#fff",
                        color: "#0f172a", fontWeight: 700, fontSize: 13,
                        cursor: "pointer", transition: "all 0.2s",
                        whiteSpace: "nowrap" as const,
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "#3b82f6"; (e.target as HTMLElement).style.color = "#3b82f6"; (e.target as HTMLElement).style.background = "#eff6ff"; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "#e2e8f0"; (e.target as HTMLElement).style.color = "#0f172a"; (e.target as HTMLElement).style.background = "#fff"; }}
                    >
                      {user.hasPassword === false ? "Set Password" : "Change Password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <UpdateProfileModal
        isOpen={isUpdateProfileOpen}
        onClose={() => setIsUpdateProfileOpen(false)}
        user={user}
        onSuccess={fetchProfile}
      />
      <UpdatePasswordModal
        isOpen={isUpdatePasswordOpen}
        onClose={() => setIsUpdatePasswordOpen(false)}
        hasPassword={user.hasPassword}
        onSuccess={fetchProfile}
      />
      <UpdateEmailModal
        isOpen={isUpdateEmailOpen}
        onClose={() => setIsUpdateEmailOpen(false)}
        currentEmail={user.email}
        onSuccess={fetchProfile}
      />
    </>
  );
};

export default UserProfilePage;
