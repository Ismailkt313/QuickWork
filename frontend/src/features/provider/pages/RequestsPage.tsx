import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiMailOpenLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiLoader4Line,
  RiInboxLine,
  RiFileListLine,
  RiUserReceivedLine,
  RiArrowRightLine,
  RiMapPinUserLine,
  RiMapPinRangeLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import { RequestCard } from "../components/RequestCard";
import UniversalActionModal from "../components/UniversalActionModal";
import ActionErrorModal from "../components/ActionErrorModal";
import { acceptOffer, rejectOffer, getMyProfile } from "../services/provider.service";
import AcceptConfirmationModal from "../components/AcceptConfirmationModal";
import RejectConfirmationModal from "../components/RejectConfirmationModal";
import VerificationPendingModal from "../components/VerificationPendingModal";
import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";
import type { JobDetail } from "../types/job";
import { useProviderLocation } from "../hooks/useProviderLocation";

type FilterType = "all" | "pending" | "accepted" | "rejected";

const TABS = [
  { id: "all",      label: "All",      icon: <RiFileListLine /> },
  { id: "pending",  label: "Pending",  icon: <RiMailOpenLine /> },
  { id: "accepted", label: "Accepted", icon: <RiCheckboxCircleLine /> },
  { id: "rejected", label: "Declined", icon: <RiCloseCircleLine /> },
] as const;

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<JobDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [actionError, setActionError] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  const providerLocation = useProviderLocation();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(ENDPOINTS.JOB.OFFERS);
      if (response.data.success) setRequests(response.data.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch requests";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const fetchStatus = async () => {
      try {
        const response = await getMyProfile<{ verificationStatus: string }>();
        if (response.success && response.data) {
          setVerificationStatus(response.data.verificationStatus || "pending");
        }
      } catch (err: unknown) {
        console.error("Error fetching profile status:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleAccept = async (jobId: string) => {
    if (verificationStatus === "pending") { setIsPendingModalOpen(true); return; }
    setPendingJobId(jobId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAfterSelection = () => {
    setIsConfirmModalOpen(false);
    const jobId = pendingJobId;
    if (!jobId) return;
    const job = requests.find(r => r.id === jobId);
    if (job && job.location?.districtName !== providerLocation) setIsLocationModalOpen(true);
    else confirmAccept(jobId);
  };

  const confirmAccept = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const response = await acceptOffer(jobId);
      if (response.success) { toast.success("Invitation accepted! Job is now assigned to you."); fetchRequests(); }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to accept invitation";
      setActionError({ isOpen: true, title: errorMessage.toLowerCase().includes("overlap") ? "Schedule Conflict" : "Action Failed", message: errorMessage });
    } finally {
      setActionLoading(null); setPendingJobId(null);
    }
  };

  const handleReject = async (jobId: string) => { setPendingJobId(jobId); setIsRejectModalOpen(true); };

  const confirmReject = async () => {
    const jobId = pendingJobId;
    if (!jobId) return;
    try {
      setActionLoading(jobId);
      const response = await rejectOffer(jobId);
      if (response.success) { toast.info("Invitation declined."); fetchRequests(); }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reject invitation";
      toast.error(errorMessage);
    } finally {
      setActionLoading(null); setPendingJobId(null); setIsRejectModalOpen(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filter === "all") return true;
    if (filter === "pending") return req.status === "open";
    if (filter === "accepted") return req.status === "fully_assigned";
    if (filter === "rejected") return req.status === "cancelled" || req.status === "rejected";
    return true;
  });

  const pendingCount  = requests.filter(r => r.status === "open").length;
  const acceptedCount = requests.filter(r => r.status === "fully_assigned").length;
  const rejectedCount = requests.filter(r => r.status === "cancelled" || r.status === "rejected").length;

  const tabCount = (id: string) => {
    if (id === "all") return requests.length;
    if (id === "pending") return pendingCount;
    if (id === "accepted") return acceptedCount;
    if (id === "rejected") return rejectedCount;
    return 0;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "32px 32px 48px" }}>

      {}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg, #9333ea, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 19 }}>
                <RiUserReceivedLine />
              </div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif", letterSpacing: "-0.5px" }}>
                Direct Invitations
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
              Clients who specifically requested your services — <strong style={{ color: "#0f172a" }}>{requests.length}</strong> total
            </p>
          </div>

          {}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Pending", count: pendingCount, bg: "#eff6ff", color: "#3b82f6", border: "#bfdbfe" },
              { label: "Accepted", count: acceptedCount, bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
              { label: "Declined", count: rejectedCount, bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
            ].map(stat => (
              <div key={stat.label} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: stat.color, fontFamily: "Syne, sans-serif" }}>{stat.count}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: stat.color, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#fff", borderRadius: 10, padding: "4px", border: "1px solid #e8edf4", width: "fit-content" }}>
        {TABS.map(tab => {
          const count = tabCount(tab.id);
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterType)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: isActive ? (tab.id === "pending" ? "#6366f1" : tab.id === "accepted" ? "#16a34a" : tab.id === "rejected" ? "#dc2626" : "#334155") : "transparent", color: isActive ? "#fff" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" as const }}
            >
              {tab.icon} {tab.label}
              {count > 0 && (
                <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: 10, fontWeight: 700, background: isActive ? "rgba(255,255,255,0.25)" : "#f1f5f9", color: isActive ? "#fff" : "#64748b" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
            <RiLoader4Line size={28} color="#9333ea" style={{ animation: "spin 1s linear infinite" }} />
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#64748b", fontWeight: 500 }}>Loading your invitations...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px dashed #e2e8f0", padding: "56px 32px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#94a3b8" }}>
            <RiInboxLine size={36} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#0f172a", fontFamily: "Syne, sans-serif" }}>
            No {filter !== "all" ? filter : ""} Invitations
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#64748b", maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
            When clients hire you directly from your profile, their invitations will appear here for you to accept or decline.
          </p>
          <button
            onClick={fetchRequests}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 24px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Refresh <RiArrowRightLine />
          </button>
        </div>
      ) : (
        <div style={{ maxWidth: 760 }}>
          {filteredRequests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={handleAccept}
              onReject={handleReject}
              onMessage={(userId, name) => navigate(`/provider/messages?userId=${userId}&name=${encodeURIComponent(name)}`)}
              isActionLoading={actionLoading === request.id}
            />
          ))}
        </div>
      )}

      {}
      <UniversalActionModal
        isOpen={isLocationModalOpen}
        onClose={() => { setIsLocationModalOpen(false); setPendingJobId(null); }}
        onConfirm={() => pendingJobId && confirmAccept(pendingJobId)}
        title="Location Mismatch"
        message="This opportunity is outside your default work zone. Confirm you can accommodate the travel requirements."
        iconType="location"
      >
        <div className="row g-3">
          <div className="col-6">
            <div className="p-3 bg-light rounded-4 border">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-bold text-uppercase"><RiMapPinUserLine size={14} /> Your Zone</div>
              <div className="fw-bold text-dark small">{providerLocation || "Not Set"}</div>
            </div>
          </div>
          <div className="col-6">
            <div className="p-3 bg-primary-subtle rounded-4 border border-primary-subtle">
              <div className="d-flex align-items-center gap-2 mb-2 text-primary small fw-bold text-uppercase"><RiMapPinRangeLine size={14} /> Job Zone</div>
              <div className="fw-bold text-primary small">{requests.find(r => r.id === pendingJobId)?.location?.address || "Remote"}</div>
            </div>
          </div>
        </div>
      </UniversalActionModal>

      <ActionErrorModal
        isOpen={actionError.isOpen}
        onClose={() => setActionError(prev => ({ ...prev, isOpen: false }))}
        title={actionError.title}
        message={actionError.message}
        primaryAction={actionError.title === "Schedule Conflict" ? { label: "View My Schedule", onClick: () => navigate("/provider/my-jobs") } : undefined}
      />

      <AcceptConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setPendingJobId(null); }}
        onConfirm={handleConfirmAfterSelection}
        jobTitle={requests.find(r => r.id === pendingJobId)?.title}
        isActionLoading={!!(pendingJobId && actionLoading === pendingJobId)}
      />

      <VerificationPendingModal isOpen={isPendingModalOpen} onClose={() => setIsPendingModalOpen(false)} />

      <RejectConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => { setIsRejectModalOpen(false); setPendingJobId(null); }}
        onConfirm={confirmReject}
        jobTitle={requests.find(r => r.id === pendingJobId)?.title}
        isActionLoading={!!(pendingJobId && actionLoading === pendingJobId)}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RequestsPage;
