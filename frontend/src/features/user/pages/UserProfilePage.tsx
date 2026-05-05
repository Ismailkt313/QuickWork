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

  return (
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
    </div>
  );
};

export default UserProfilePage;
