import React, { useState, useEffect } from "react";
import OnboardingLayout from "../providerOnboarding/components/OnboardingLayout";
import RejectionNoticeModal from "../components/RejectionNoticeModal";
import {
  getMyProfile,
  resetProviderApplication,
} from "../services/provider.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BecomeProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getMyProfile();
        console.log(response, "ithan ividathe response");
        if (
          response.success &&
          response.data?.verificationStatus === "rejected"
        ) {
          setIsRejected(true);
          setRejectionReason(response.data.rejectionReason || "");
        }
      } catch (error) {
        // If 404, it means no profile exists yet, which is fine for new onboarding
        console.log(
          "No existing provider profile or error fetching profile:",
          error,
        );
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, []);

  const handleRestart = async () => {
    setResetting(true);
    try {
      const response = await resetProviderApplication();
      if (response.success) {
        toast.success("Application reset. You can now start fresh.");
        setIsRejected(false);
        // Refreshing the page state is handled by setting isRejected to false
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reset application");
    } finally {
      setResetting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            Checking application status...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="become-provider-page">
      <OnboardingLayout />

      <RejectionNoticeModal
        isOpen={isRejected}
        onClose={() => navigate("/")}
        reason={rejectionReason}
        onRestart={handleRestart}
        loading={resetting}
      />
    </div>
  );
};

export default BecomeProviderPage;
