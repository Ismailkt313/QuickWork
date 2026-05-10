import React, { useState, useEffect } from "react";
import {
  RiUser3Line,
  RiMailLine,
  RiPhoneLine,
  RiShieldLine,
  RiEditLine,
  RiTimeLine,
} from "react-icons/ri";
import { getMe } from "../../auth/services/authApi";
import UpdateProfileModal from "../components/UpdateProfileModal";
import UpdatePasswordModal from "../components/UpdatePasswordModal";
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
}

const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
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
      {/* --- Premium Mobile Header --- */}
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

      {/* --- Compact Info Grid --- */}
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

      {/* --- Operational Action List --- */}
      <div className="m-action-section">
        <h3 className="m-section-title">Account Settings</h3>
        <div className="m-action-list">
          <button className="m-action-item" onClick={() => setIsUpdateProfileOpen(true)}>
            <div className="m-ai-icon"><RiUser3Line /></div>
            <div className="m-ai-text">
              <span className="m-ai-title">Personal Details</span>
              <span className="m-ai-sub">Name, phone, and profile info</span>
            </div>
            <RiEditLine className="m-ai-arrow" />
          </button>
          <button className="m-action-item" onClick={() => setIsUpdatePasswordOpen(true)}>
            <div className="m-ai-icon"><RiShieldLine /></div>
            <div className="m-ai-text">
              <span className="m-ai-title">Login & Security</span>
              <span className="m-ai-sub">Manage password and safety</span>
            </div>
            <RiEditLine className="m-ai-arrow" />
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
          font-size: 16px;
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
          style={{ maxWidth: "1000px" }}
        >
          <div className="mb-4">
            <h1 className="h3 fw-bold text-dark mb-1">My Profile</h1>
            <p className="text-secondary small">
              Manage your personal information and security settings
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="bg-primary text-white p-4 text-center">
                  <div
                    className="mx-auto mb-3 overflow-hidden"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                      fontWeight: "bold",
                      border: "4px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    {user.profileImage ? (
                      <img
                        src={user.profileImage.url}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      userInitials
                    )}
                  </div>
                  <h4 className="fw-bold mb-1">{user.name}</h4>
                  <span className="badge bg-light text-primary rounded-pill px-3 py-2 small fw-bold">
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <div className="card-body p-4 text-center">
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-4 text-secondary small">
                    <RiTimeLine />
                    <span>
                      Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsUpdateProfileOpen(true)}
                    className="btn btn-primary w-100 rounded-3 py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
                  >
                    <RiEditLine size={18} />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-header bg-transparent border-bottom p-4 py-3 d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <RiUser3Line className="text-primary" />
                    Personal Information
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-12 col-md-6 text-start">
                      <label className="text-secondary small fw-bold text-uppercase mb-1 d-block">
                        Full Name
                      </label>
                      <div className="fw-semibold text-dark p-2 rounded bg-light border-start border-primary border-4">
                        {user.name}
                      </div>
                    </div>
                    <div className="col-12 col-md-6 text-start">
                      <label className="text-secondary small fw-bold text-uppercase mb-1 d-block">
                        Email Address
                      </label>
                      <div className="d-flex align-items-center gap-2 p-2 rounded bg-light border-start border-4 text-dark overflow-hidden">
                        <RiMailLine className="text-secondary flex-shrink-0" />
                        <span className="text-truncate">{user.email}</span>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 text-start">
                      <label className="text-secondary small fw-bold text-uppercase mb-1 d-block">
                        Phone Number
                      </label>
                      <div className="d-flex align-items-center gap-2 p-2 rounded bg-light border-start border-4 text-dark">
                        <RiPhoneLine className="text-secondary" />
                        <span>{user.number || "Not provided"}</span>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 text-start">
                      <label className="text-secondary small fw-bold text-uppercase mb-1 d-block">
                        Account Type
                      </label>
                      <div className="p-2 rounded bg-light border-start border-4 text-dark text-capitalize">
                        {user.role} Account
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-header bg-transparent border-bottom p-4 py-3 d-flex align-items-center justify-content-between">
                  <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                    <RiShieldLine className="text-primary" />
                    Security Settings
                  </h5>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 text-start">
                    <div>
                      <h6 className="fw-bold mb-1">Account Password</h6>
                      <p className="text-secondary small mb-0">
                        It's a good idea to use a strong password that you're not
                        using elsewhere
                      </p>
                    </div>
                    <button
                      onClick={() => setIsUpdatePasswordOpen(true)}
                      className="btn btn-outline-primary rounded-3 px-4 py-2 small fw-bold flex-shrink-0"
                    >
                      Change Password
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
      />
    </>
  );
};

export default UserProfilePage;
