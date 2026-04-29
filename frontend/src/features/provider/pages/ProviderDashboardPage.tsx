import React, { useEffect, useState } from "react";
import ProviderDashboardHeader from "../components/ProviderDashboardHeader";
import ProviderDashboardCards from "../components/ProviderDashboardCards";
import VerificationStatus from "../components/VerificationStatus";
import { getMyProfile } from "../services/provider.service";
import "./style/DashboardPage.css";
import { VERIFICATION_STATUS } from "../../../constants/verification";

interface Profile {
  verificationStatus?: {
    status: (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
    rejectionReason?: string;
  };
}

const ProviderDashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await getMyProfile<Profile>();
      if (response.success && response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching provider profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="placeholder-glow">
          <div
            className="placeholder col-12 mb-4"
            style={{ height: "100px", borderRadius: "16px" }}
          ></div>
          <div className="row g-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-md-3">
                <div
                  className="placeholder col-12"
                  style={{ height: "120px", borderRadius: "12px" }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const verification = profile?.verificationStatus || {
    status: VERIFICATION_STATUS.PENDING,
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard-container">
        <VerificationStatus
          status={verification.status}
          rejectionReason={verification.rejectionReason}
          onRefresh={fetchProfile}
        />

        <ProviderDashboardHeader />
        <ProviderDashboardCards />

        <div className="card border-0 shadow-sm mt-4">
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="m-0 fw-bold">Recent Activity</h5>
          </div>
          <div className="card-body p-5 text-center text-secondary">
            <div className="mb-3 opacity-25">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h6 className="fw-bold text-dark">No Recent Activity</h6>
            <p className="mb-0 small">
              Your job records and assignments will appear here once you start
              working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboardPage;
