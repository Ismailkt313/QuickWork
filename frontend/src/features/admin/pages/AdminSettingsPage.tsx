import React, { useEffect, useState } from "react";
import { Adminapi } from "../services/adminApi";
import { ENDPOINTS } from "../../../constants/endpoints";
import { 
  RiShieldUserLine, 
  RiMapPinLine, 
  RiMailLine, 
  RiPhoneLine, 
  RiInformationLine,
  RiTimeLine,
  RiLockPasswordLine,
  RiLayoutGridLine,
  RiBarChartLine,
  RiDoubleQuotesL
} from "react-icons/ri";
import { toast } from "react-toastify";
import "../admin.css";
import "./AdminSettings.css";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  number?: string;
  location?: string;
  createdAt: string;
}

const AdminSettingsPage: React.FC = () => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const response = await Adminapi.get(ENDPOINTS.AUTH.ME);
        if (response.data.success) {
          setAdmin(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile", error);
        toast.error("Failed to load admin profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-container d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings-container animate-fade-in">
      <div className="admin-settings-header mb-4">
        <div>
          <h1 className="admin-page-title">Admin Settings</h1>
          <p className="admin-page-subtitle">Manage your account and platform configurations</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <div className="admin-settings-column">
          <div className="admin-card profile-card">
            <div className="profile-header-gradient"></div>
            <div className="profile-content text-center">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {admin?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="role-badge">
                  <RiShieldUserLine />
                  <span>{admin?.role?.toUpperCase() || "ADMIN"}</span>
                </div>
              </div>
              <h2 className="admin-name">{admin?.name || "Administrator"}</h2>
              <p className="admin-email">{admin?.email}</p>
              
              <div className="admin-details-list">
                <div className="detail-item">
                  <RiMailLine />
                  <span>{admin?.email}</span>
                </div>
                <div className="detail-item">
                  <RiPhoneLine />
                  <span>{admin?.number || "+91 98765 43210"}</span>
                </div>
                <div className="detail-item">
                  <RiMapPinLine />
                  <span>{admin?.location || "Headquarters, Bangalore"}</span>
                </div>
                <div className="detail-item">
                  <RiTimeLine />
                  <span>Joined {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "March 2024"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card mt-4 p-4">
            <h3 className="section-title mb-3">
              <RiLockPasswordLine className="me-2 text-primary" />
              Security Settings
            </h3>
            <div className="security-item d-flex justify-content-between align-items-center mb-3">
              <div>
                <p className="item-label mb-0 fw-bold">Password</p>
                <p className="item-sub text-muted small mb-0">Last changed 3 months ago</p>
              </div>
              <button className="btn btn-sm btn-outline-primary">Update</button>
            </div>
            <div className="security-item d-flex justify-content-between align-items-center">
              <div>
                <p className="item-label mb-0 fw-bold">Two-Factor Auth</p>
                <p className="item-sub text-muted small mb-0">Currently enabled</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" defaultChecked readOnly />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-settings-column">
          <div className="admin-card blog-card p-4">
            <div className="d-flex align-items-center gap-2 mb-4">
              <RiInformationLine className="text-primary" size={24} />
              <h3 className="section-title mb-0">Platform Overview & Insights</h3>
            </div>

            <div className="blog-section mb-4">
              <div className="blog-header d-flex align-items-center gap-3 mb-3">
                <div className="icon-box bg-primary-soft text-primary">
                  <RiLayoutGridLine size={24} />
                </div>
                <h4 className="blog-title mb-0">QuickWork Ecosystem</h4>
              </div>
              <p className="blog-content text-secondary">
                QuickWork is more than just a marketplace; it's a dynamic ecosystem designed to bridge the gap between demand and skilled expertise. Our platform architecture prioritizes safety, speed, and transparency, ensuring that every interaction—from job posting to payment confirmation—is seamless.
              </p>
            </div>

            <div className="blog-section mb-4">
              <div className="blog-header d-flex align-items-center gap-3 mb-3">
                <div className="icon-box bg-success-soft text-success">
                  <RiBarChartLine size={24} />
                </div>
                <h4 className="blog-title mb-0">The Financial Engine</h4>
              </div>
              <p className="blog-content text-secondary">
                Unlike traditional escrow systems, QuickWork utilizes a innovative <strong>Financial Tracking Ledger</strong>. This approach provides real-time transparency into platform fees and provider dues without holding user funds. This decentralized financial model empowers providers while maintaining platform sustainability through automated fee tracking.
              </p>
            </div>

            <div className="blog-section">
              <div className="blog-header d-flex align-items-center gap-3 mb-3">
                <div className="icon-box bg-warning-soft text-warning">
                  <RiShieldUserLine size={24} />
                </div>
                <h4 className="blog-title mb-0">Safety & Moderation Philosophy</h4>
              </div>
              <p className="blog-content text-secondary">
                Our core mission is to build the world's most trusted service marketplace. The <strong>Report & Moderation system</strong> we've implemented isn't just about policing; it's about education and community standards. With a multi-tiered approach (Warn, Block, Reject), we ensure that every administrative action is backed by an immutable audit trail.
              </p>
            </div>

            <div className="quote-box mt-4">
              <RiDoubleQuotesL className="quote-icon" />
              <p className="quote-text italic">
                "Empowering individual expertise through a transparent, secure, and technologically advanced infrastructure is the cornerstone of QuickWork's vision."
              </p>
              <div className="quote-author">
                <strong>Platform Vision 2026</strong>
              </div>
            </div>
          </div>

          <div className="admin-card mt-4 p-4">
            <h3 className="section-title mb-3">Platform Stats Summary</h3>
            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 bg-light rounded-4">
                  <p className="text-muted small mb-1">Status</p>
                  <p className="fw-bold mb-0 text-success">Active & Stable</p>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-4">
                  <p className="text-muted small mb-1">Version</p>
                  <p className="fw-bold mb-0">v2.4.0-stable</p>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-4">
                  <p className="text-muted small mb-1">Last Update</p>
                  <p className="fw-bold mb-0">2 hours ago</p>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-light rounded-4">
                  <p className="text-muted small mb-1">System Health</p>
                  <p className="fw-bold mb-0 text-primary">99.9% Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
