import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiMailOpenLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiLoader4Line,
  RiInboxLine,
  RiFileListLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import { RequestCard } from "../components/RequestCard";
import UniversalActionModal from "../components/UniversalActionModal";
import ActionErrorModal from "../components/ActionErrorModal";
import { RiMapPinUserLine, RiMapPinRangeLine } from "react-icons/ri";
import {
  acceptOffer,
  rejectOffer,
  getMyProfile,
} from "../services/provider.service";
import AcceptConfirmationModal from "../components/AcceptConfirmationModal";
import VerificationPendingModal from "../components/VerificationPendingModal";
import { api } from "../../../services/api";
import type { JobDetail } from "../types/job";
import { useProviderLocation } from "../hooks/useProviderLocation";

type FilterType = "all" | "pending" | "accepted" | "rejected";

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<JobDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("pending");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionError, setActionError] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<string>("pending");
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  const providerLocation = useProviderLocation();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/job/offers");
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const fetchStatus = async () => {
      try {
        const response = await getMyProfile();
        if (response.success && response.data) {
          setVerificationStatus(response.data.verificationStatus || "pending");
        }
      } catch (err) {
        console.error("Error fetching profile status:", err);
      }
    };
    fetchStatus();
  }, []);

  const handleAccept = async (jobId: string) => {
    if (verificationStatus === "pending") {
      setIsPendingModalOpen(true);
      return;
    }
    setPendingJobId(jobId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAfterSelection = () => {
    setIsConfirmModalOpen(false);
    const jobId = pendingJobId;
    if (!jobId) return;

    const job = requests.find((r) => r.id === jobId);
    if (job && job.location?.districtName !== providerLocation) {
      setIsLocationModalOpen(true);
    } else {
      confirmAccept(jobId);
    }
  };

  const confirmAccept = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const response = await acceptOffer(jobId);
      if (response.success) {
        toast.success("Interest accepted! Job is now assigned to you.");
        fetchRequests();
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to accept invitation";
      setActionError({
        isOpen: true,
        title: errorMessage.toLowerCase().includes("overlap")
          ? "Schedule Conflict"
          : "Action Failed",
        message: errorMessage,
      });
    } finally {
      setActionLoading(null);
      setPendingJobId(null);
    }
  };

  const handleReject = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const response = await rejectOffer(jobId);
      if (response.success) {
        toast.info("Invitation rejected.");
        fetchRequests();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject invitation");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    if (filter === "pending") return req.status === "open";
    if (filter === "accepted") return req.status === "fully_assigned";
    if (filter === "rejected")
      return req.status === "cancelled" || req.status === "rejected";
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "open").length;
  const acceptedCount = requests.filter(
    (r) => r.status === "fully_assigned",
  ).length;

  return (
    <div
      className="container-fluid py-4 px-lg-5"
      style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
        <div>
          <h2
            className="mb-1 fw-bold"
            style={{
              color: "#0f172a",
              fontFamily: "Syne, sans-serif",
              letterSpacing: "-0.5px",
            }}
          >
            Direct Invitations
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "14.5px" }}>
            Manage jobs where clients have specifically requested your services.
          </p>
        </div>
        <div className="d-flex align-items-center gap-4 bg-white p-2 rounded-4 shadow-sm border border-f1f5f9">
          <div className="text-center px-3 border-end">
            <div className="fw-bold text-primary" style={{ fontSize: "18px" }}>
              {pendingCount}
            </div>
            <div
              className="text-muted"
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Pending
            </div>
          </div>
          <div className="text-center px-3">
            <div className="fw-bold text-success" style={{ fontSize: "18px" }}>
              {acceptedCount}
            </div>
            <div
              className="text-muted"
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Accepted
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All Requests", icon: <RiFileListLine /> },
          {
            id: "pending",
            label: "Pending",
            icon: <RiMailOpenLine />,
            count: pendingCount,
          },
          { id: "accepted", label: "Accepted", icon: <RiCheckboxCircleLine /> },
          { id: "rejected", label: "Rejected", icon: <RiCloseCircleLine /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as FilterType)}
            className={`d-flex align-items-center gap-2 px-4 py-2-5 rounded-pill border-0 transition-all ${filter === tab.id ? "bg-primary text-white shadow-lg" : "bg-white text-muted hover-bg-light border border-f1f5f9"}`}
            style={{ fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap" }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`badge rounded-pill ms-1 ${filter === tab.id ? "bg-white text-primary" : "bg-primary-subtle text-primary"}`}
                style={{ fontSize: "10px" }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="row g-4 justify-content-center">
        <div className="col-12 col-xl-10">
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <RiLoader4Line
                size={48}
                className="text-primary animate-spin mb-3"
              />
              <p className="text-muted fw-semibold">
                Discovering your invitations...
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div
              className="text-center py-5 px-4 bg-white rounded-5 border border-dashed border-2 border-slate-200 mt-4"
              style={{ borderStyle: "dashed" }}
            >
              <div
                className="mb-4 d-inline-flex align-items-center justify-content-center"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 24,
                  background: "#f1f5f9",
                  color: "#94a3b8",
                }}
              >
                <RiInboxLine size={42} />
              </div>
              <h4
                className="fw-bold text-dark"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                No {filter !== "all" ? filter : ""} requests found
              </h4>
              <p
                className="text-muted mx-auto"
                style={{ maxWidth: 360, fontSize: "14.5px" }}
              >
                When clients hire you directly from your profile, their
                invitations will appear here for you to accept or reject.
              </p>
              <button
                className="btn btn-outline-primary px-4 py-2-5 rounded-3 fw-bold mt-2"
                onClick={fetchRequests}
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onMessage={(userId, name) =>
                    navigate(
                      `/provider/messages?userId=${userId}&name=${encodeURIComponent(name)}`,
                    )
                  }
                  isActionLoading={actionLoading === request.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <UniversalActionModal
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setPendingJobId(null);
        }}
        onConfirm={() => pendingJobId && confirmAccept(pendingJobId)}
        title="Location Mismatch"
        message="This opportunity is located outside your default work zone. Please confirm you can accommodate the travel requirements."
        iconType="location"
      >
        <div className="row g-3">
          <div className="col-6">
            <div className="p-3 bg-light rounded-4 border">
              <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-bold text-uppercase">
                <RiMapPinUserLine size={14} />
                Your Zone
              </div>
              <div className="fw-bold text-dark small">
                {providerLocation || "Not Set"}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="p-3 bg-primary-subtle rounded-4 border border-primary-subtle">
              <div className="d-flex align-items-center gap-2 mb-2 text-primary small fw-bold text-uppercase">
                <RiMapPinRangeLine size={14} />
                Job Zone
              </div>
              <div className="fw-bold text-primary small">
                {requests.find((r) => r.id === pendingJobId)?.location
                  ?.address || "Remote"}
              </div>
            </div>
          </div>
        </div>
      </UniversalActionModal>

      <ActionErrorModal
        isOpen={actionError.isOpen}
        onClose={() => setActionError((prev) => ({ ...prev, isOpen: false }))}
        title={actionError.title}
        message={actionError.message}
        primaryAction={
          actionError.title === "Schedule Conflict"
            ? {
                label: "View My Schedule",
                onClick: () => {
                  navigate("/provider/my-jobs");
                },
              }
            : undefined
        }
      />

      <AcceptConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPendingJobId(null);
        }}
        onConfirm={handleConfirmAfterSelection}
        jobTitle={requests.find((r) => r.id === pendingJobId)?.title}
        isActionLoading={!!(pendingJobId && actionLoading === pendingJobId)}
      />

      <VerificationPendingModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
      />

      <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .hover-bg-light:hover { background-color: #f1f5f9 !important; transform: translateY(-1px); }
                .transition-all { transition: all 0.2s ease-in-out; }
            `}</style>
    </div>
  );
};
export default RequestsPage;
