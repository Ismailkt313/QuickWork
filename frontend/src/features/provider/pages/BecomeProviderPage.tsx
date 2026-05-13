import React, { useState, useEffect } from "react";
import OnboardingLayout from "../providerOnboarding/components/OnboardingLayout";
import RejectionNoticeModal from "../components/RejectionNoticeModal";
import { getMyProfile, resetProviderApplication } from "../services/provider.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BecomeProviderPage: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getMyProfile<{ verificationStatus: string; rejectionReason?: string }>()
      .then(r => {
        if (r.success && r.data?.verificationStatus === "rejected") {
          setIsRejected(true);
          setRejectionReason(r.data.rejectionReason || "");
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleRestart = async () => {
    setResetting(true);
    try {
      const r = await resetProviderApplication();
      if (r.success) { toast.success("Application reset. Start fresh!"); setIsRejected(false); }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #2563eb", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500 }}>Checking application status…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <OnboardingLayout />
      <RejectionNoticeModal
        isOpen={isRejected}
        onClose={() => navigate("/")}
        reason={rejectionReason}
        onRestart={handleRestart}
        loading={resetting}
      />
    </>
  );
};

export default BecomeProviderPage;
