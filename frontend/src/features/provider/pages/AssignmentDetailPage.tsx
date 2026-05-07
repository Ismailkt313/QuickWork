import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine, RiTimeLine, RiMapPinLine, RiMoneyDollarCircleLine,
  RiCheckboxCircleLine, RiPlayCircleLine, RiHistoryLine, RiMessage2Line,
  RiLoader4Line, RiAttachmentLine, RiCloseLine, RiStarLine, RiStarFill,
  RiErrorWarningLine, RiInformationLine, RiGroupLine,
  RiCalendarLine, RiShieldCheckLine, RiFlashlightLine,
} from "react-icons/ri";
import { toast } from "react-toastify";
import {
  getAssignmentById, updateAssignmentStatus, submitAssignmentProof,
  cancelAssignmentByProvider, submitReview, submitReport,
  confirmPayment, providerMarkAsPaid, rejectPayment,
  getReviewsForAssignment, updateReview, deleteReview
} from "../services/provider.service";
import ReviewModal from "../components/ReviewModal";
import ReportIssueModal from "../components/ReportIssueModal";
import SubmitProofModal from "../components/SubmitProofModal";
import JobLogModal from "../components/JobLogModal";
import CancellationModal from "../components/CancellationModal";
import UniversalActionModal from "../components/UniversalActionModal";
import { ClientProfileModal } from "../components/ClientProfileModal";
import Map from "../components/Map";
import ProviderPaymentSection from "../../finance/components/ProviderPaymentSection";

const STATUS_CFG: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ReactNode }> = {
  assigned: { color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", label: "Assigned", icon: <RiCheckboxCircleLine /> },
  in_progress: { color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", label: "In Progress", icon: <RiPlayCircleLine /> },
  completed: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", label: "Completed", icon: <RiCheckboxCircleLine /> },
  cancelled: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", label: "Cancelled", icon: <RiCloseLine /> },
  absent: { color: "#b45309", bg: "#fffbeb", border: "#fde68a", label: "Absent", icon: <RiInformationLine /> },
};

const DURATION: Record<string, string> = { half_day: "Half Day (~4 hrs)", full_day: "Full Day (8 hrs)", multi_day: "Multiple Days" };

const InfoCell: React.FC<{ icon: React.ReactNode; label: string; value: string; bg: string; color: string }> = ({ icon, label, value, bg, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
    <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{value}</div>
    </div>
  </div>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "success" | "danger" | "ghost" }> = ({ variant = "primary", children, style, ...rest }) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "linear-gradient(135deg,#6366f1,#4f46e5)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" },
    success: { background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", boxShadow: "0 4px 14px rgba(34,197,94,0.3)" },
    danger: { background: "#fff", color: "#dc2626", border: "1.5px solid #fecaca" },
    ghost: { background: "#f8fafc", color: "#64748b", border: "1.5px solid #e2e8f0" },
  };
  return (
    <button style={{ width: "100%", padding: "12px 20px", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", ...styles[variant], ...style }} {...rest}>
      {children}
    </button>
  );
};

interface Review {
  id: string;
  assignmentId: string;
  reviewerId: { id: string; name: string };
  revieweeId: { id: string; name: string };
  role: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

interface Assignment {
  id: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: { address: string; lat: number; lng: number };
    budget: string;
    durationType: string;
    isUrgent?: boolean;
    visibility?: string;
    freelancersNeeded?: number;
    skills: string[];
    clientName: string;
    clientInitials: string;
    clientAvatarUrl?: string;
    isClientVerified?: boolean;
    clientId: string;
    clientEmail?: string;
    clientNumber?: string;
    additionalDetails?: string;
  };
  workStatus: string;
  invitedAt: string;
  respondedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancellation?: {
    cancelledAt: string;
    notes?: string;
  };
  absence?: {
    reportedAt: string;
    notes?: string;
  };
  schedule: {
    startDate: string;
    endDate: string;
  };
  coWorkers?: {
    id: string;
    userId: string;
    name: string;
    profileImage?: string;
    workStatus: string;
  }[];
  proof?: string[];
  proofDescription?: string;
  payment?: {
    status: string;
    method?: string;
    amount: number;
    paidAt?: string;
    transactionId?: string;
  };
}

const AssignmentDetailPage: React.FC = () => {
  const { assignmentId } = useParams() as { assignmentId: string };
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [editReviewState, setEditReviewState] = useState<{
    isEdit: boolean;
    initialRating?: number;
    initialComment?: string;
    initialImages?: string[];
  }>({ isEdit: false });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: "confirm_receipt" | "mark_paid" | "reject" | "delete_review" } | null>(null);

  const job = assignment?.job;
  const workStatus = assignment?.workStatus;
  const schedule = assignment?.schedule;
  const coWorkers = assignment?.coWorkers;
  const proof = assignment?.proof;
  const proofDescription = assignment?.proofDescription;

  const fetchMyReview = useCallback(async () => {
    try {

      const res = await getReviewsForAssignment(assignmentId);

      if (res.success && Array.isArray(res.data)) {
        const foundReview = res.data.find((r: Review) => r.role === "provider_to_client");

        setMyReview(foundReview || null);
      } else {
        console.warn("Unexpected review response structure or failure:", res);
        setMyReview(null);
      }
    } catch (err) {
      console.error("Critical failure in fetchMyReview:", err);
      setMyReview(null);
    }
  }, [assignmentId]);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const r = await getAssignmentById(assignmentId);
      if (r.success) {
        setAssignment(r.data);
        await fetchMyReview();
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to load";
      toast.error(errorMessage);
      navigate("/provider/my-jobs");
    } finally {
      setLoading(false);
    }
  }, [assignmentId, navigate, fetchMyReview]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const withLoad = async (fn: () => Promise<void>) => { setActionLoading(true); try { await fn(); } finally { setActionLoading(false); } };

  const handleStatus = (s: string) => withLoad(async () => {
    const r = await updateAssignmentStatus(assignmentId, s);
    if (r.success) { toast.success(`Status updated to ${s.replace("_", " ")}`); fetch(); }
  });

  const handleProof = (data: { images: string[]; description: string }) => withLoad(async () => {
    const r = await submitAssignmentProof(assignmentId, data);
    if (r.success) { toast.success("Proof submitted!"); fetch(); setIsProofModalOpen(false); }
  });

  const handleCancel = (notes: string) => withLoad(async () => {
    const r = await cancelAssignmentByProvider(assignmentId, notes);
    if (r.success) { toast.success("Cancelled"); fetch(); setIsCancelModalOpen(false); }
  });

  const handleReview = async (rating: number, comment: string, images: string[]) => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      let r;
      if (editReviewState.isEdit && myReview) {
        r = await updateReview(myReview.id, { rating, comment, images });
      } else if (job) {
        r = await submitReview({ assignmentId, revieweeId: job.clientId, rating, comment, images, role: "provider_to_client" });
      }

      if (r && r.success) {
        toast.success(editReviewState.isEdit ? "Review updated!" : "Review submitted!");
        await fetch();
        setIsReviewModalOpen(false);
        setEditReviewState({ isEdit: false });
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      if (error.response?.status === 409) {
        toast.warning("You have already submitted a review for this client on this assignment.", { autoClose: 5000 });
        setIsReviewModalOpen(false);
      } else {
        toast.error(error.response?.data?.message || "Failed to handle review");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview || actionLoading) return;
    try {
      setActionLoading(true);
      const r = await deleteReview(myReview.id);
      if (r.success) {
        toast.success("Review deleted");
        setMyReview(null);
        setConfirmModal(null);
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  const renderMyReview = () => {

    if (!myReview) return null;

    return (
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf4", padding: "22px 24px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
          <h4 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "#fff7ed", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}><RiStarFill size={15} /></span>
            Your Review for Client
          </h4>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => {
                setEditReviewState({
                  isEdit: true,
                  initialRating: myReview.rating,
                  initialComment: myReview.comment,
                  initialImages: myReview.images
                });
                setIsReviewModalOpen(true);
              }}
              style={{ border: "none", background: "none", color: "#6366f1", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmModal({ isOpen: true, type: "delete_review" })}
              style={{ border: "none", background: "none", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
            >
              Delete
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex" }}>
            {[...Array(5)].map((_, i) => (
              <RiStarFill key={i} size={16} style={{ color: i < myReview.rating ? "#f59e0b" : "#e2e8f0" }} />
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{new Date(myReview.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>

        <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{myReview.comment}</p>

        {myReview.images && myReview.images.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {myReview.images.map((img, i) => (
              <img key={i} src={img} alt="review" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", border: "1px solid #f1f5f9" }} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleReport = (reason: string, description: string, images: string[]) => withLoad(async () => {
    if (!job) return;
    const r = await submitReport({ assignmentId, reportedUserId: job.clientId, reason, description, images, role: "provider_to_client" });
    if (r.success) { toast.success("Report submitted!"); setIsReportModalOpen(false); }
  });

  const handleConfirmPayment = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const res = await confirmPayment(assignmentId);
      if (res.success) {
        toast.success("Payment confirmed!");
        fetch();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to confirm payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const res = await providerMarkAsPaid(assignmentId);
      if (res.success) {
        toast.success("Marked as paid by cash!");
        fetch();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to mark as paid");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const res = await rejectPayment(assignmentId);
      if (res.success) {
        toast.success("Payment confirmation rejected.");
        fetch();
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to reject payment");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <RiLoader4Line size={40} color="#6366f1" style={{ animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!assignment || !job || !workStatus || !schedule) return null;
  const sc = STATUS_CFG[workStatus] ?? STATUS_CFG["assigned"];
  const startFmt = new Date(schedule.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const endFmt = new Date(schedule.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const isMulti = schedule.startDate !== schedule.endDate;
  const AVATAR_COLORS = ["linear-gradient(135deg,#6366f1,#8b5cf6)", "linear-gradient(135deg,#06b6d4,#0ea5e9)", "linear-gradient(135deg,#22c55e,#16a34a)", "linear-gradient(135deg,#f59e0b,#d97706)"];
  const avatarBg = AVATAR_COLORS[(job.clientName?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

  return (
    <div style={{ background: "#f1f5f9", minHeight: "100vh", padding: "28px 28px 60px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <button onClick={() => navigate("/provider/my-jobs")}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
          <RiArrowLeftLine size={16} /> My Jobs
        </button>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {sc.icon} {sc.label}
        </span>
      </div>

      <div className="adp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
        <div>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf4", overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: `linear-gradient(90deg,${sc.color},${sc.color}66)` }} />
            <div style={{ padding: "22px 24px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {job.isUrgent && <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", textTransform: "uppercase" as const }}><RiFlashlightLine size={10} style={{ verticalAlign: "middle" }} /> Urgent</span>}
                <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe", textTransform: "uppercase" as const }}>{job.durationType ? (DURATION[job.durationType] ?? job.durationType.replace(/_/g, " ")) : "—"}</span>
                {job.visibility === "private" && <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "#faf5ff", color: "#9333ea", border: "1px solid #e9d5ff", textTransform: "uppercase" as const }}>Direct Hire</span>}
              </div>

              <h1 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 26, color: "#0f172a", letterSpacing: "-0.5px", margin: "0 0 18px" }}>{job.title}</h1>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8, marginBottom: 16 }}>
                <InfoCell icon={<RiMapPinLine size={16} />} label="Location" value={job.location?.address || "Remote"} bg="#f0fdf4" color="#16a34a" />
                <InfoCell icon={<RiMoneyDollarCircleLine size={16} />} label={assignment.payment?.amount ? "Total Payment" : "Budget / Provider"} value={assignment.payment?.amount ? `₹${assignment.payment.amount}` : job.budget} bg="#eff6ff" color="#6366f1" />
                <InfoCell icon={<RiCalendarLine size={16} />} label={isMulti ? "Schedule" : "Date"} value={isMulti ? `${startFmt} → ${endFmt}` : startFmt} bg="#fff7ed" color="#ea580c" />
                <InfoCell icon={<RiTimeLine size={16} />} label="Duration" value={DURATION[job.durationType] ?? job.durationType?.replace(/_/g, " ") ?? "—"} bg="#faf5ff" color="#9333ea" />
                {job.freelancersNeeded && <InfoCell icon={<RiGroupLine size={16} />} label="Providers Needed" value={`${job.freelancersNeeded} provider${job.freelancersNeeded > 1 ? "s" : ""}`} bg="#f0fdf4" color="#16a34a" />}
              </div>
            </div>
          </div>

          {job.location && (
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #e8edf4", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", position: "relative", zIndex: 0 }}>
              <Map lat={job.location.lat} lng={job.location.lng} address={job.location.address} />
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf4", padding: "22px 24px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h4 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}><RiInformationLine size={15} /></span>
              Job Description
            </h4>
            <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{job.description}</p>

            {job.additionalDetails && (
              <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", fontSize: 13, color: "#92400e" }}>
                <strong>Additional Notes:</strong> {job.additionalDetails}
              </div>
            )}

            {job.skills?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Skills Required</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {job.skills.map((s: string, i: number) => (
                    <span key={i} style={{ padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#3b82f6" }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {renderMyReview()}

          {workStatus === "completed" && proof && proof.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf4", padding: "22px 24px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h4 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><RiAttachmentLine size={15} /></span>
                Submitted Proof
              </h4>
              {proofDescription && <p style={{ fontSize: 13.5, color: "#64748b", fontStyle: "italic", marginBottom: 14 }}>"{proofDescription}"</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {proof.map((img: string, i: number) => (
                  <img key={i} src={img} alt="Proof" style={{ width: 110, height: 110, borderRadius: 10, objectFit: "cover", border: "1px solid #e8edf4" }} />
                ))}
              </div>
            </div>
          )}

          {coWorkers && coWorkers.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf4", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h4 style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}><RiGroupLine size={15} /></span>
                Co-workers on This Job
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
                {coWorkers.map((w) => {
                  const wsc = STATUS_CFG[w.workStatus] ?? STATUS_CFG["assigned"];
                  return (
                    <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        {w.profileImage
                          ? <img src={w.profileImage} alt={w.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: "cover" }} />
                          : <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>{w.name?.slice(0, 2).toUpperCase()}</div>
                        }
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: wsc.color, border: "2px solid #fff" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: wsc.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{wsc.label}</div>
                      </div>
                      <button onClick={() => navigate(`/provider/messages?userId=${w.userId}&name=${encodeURIComponent(w.name)}`)}
                        style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                        <RiMessage2Line size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf4", padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Client</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, cursor: "pointer" }} onClick={() => setIsProfileModalOpen(true)}>
              {job.clientAvatarUrl
                ? <img src={job.clientAvatarUrl} alt={job.clientName} style={{ width: 50, height: 50, borderRadius: 13, objectFit: "cover" }} />
                : <div style={{ width: 50, height: 50, borderRadius: 13, background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 17, flexShrink: 0 }}>{job.clientInitials}</div>
              }
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 14.5, color: "#0f172a" }}>{job.clientName}</span>
                  {job.isClientVerified && <RiShieldCheckLine size={14} color="#3b82f6" />}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Tap to view profile</div>
              </div>
            </div>
            <button onClick={() => navigate(`/provider/messages?userId=${job.clientId}&name=${encodeURIComponent(job.clientName)}`)}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#6366f1", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <RiMessage2Line size={15} /> Message Client
            </button>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8edf4", padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>

              {workStatus === "assigned" && <>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "#eff6ff", border: "1px solid #c7d2fe", fontSize: 12, color: "#4f46e5", fontWeight: 500, marginBottom: 2 }}>
                  <RiInformationLine size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Start the job to notify the client work has begun.
                </div>
                <Btn variant="primary" onClick={() => handleStatus("in_progress")} disabled={actionLoading}>
                  {actionLoading ? <RiLoader4Line size={17} style={{ animation: "spin 1s linear infinite" }} /> : <RiPlayCircleLine size={17} />} Commence Job
                </Btn>
              </>}

              {workStatus === "in_progress" && <>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "#fff7ed", border: "1px solid #fed7aa", fontSize: 12, color: "#c2410c", fontWeight: 500, marginBottom: 2 }}>
                  <RiHistoryLine size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />Job is active. Submit proof once work is done.
                </div>
                <Btn variant="success" onClick={() => setIsProofModalOpen(true)} disabled={actionLoading}>
                  {actionLoading ? <RiLoader4Line size={17} style={{ animation: "spin 1s linear infinite" }} /> : <RiCheckboxCircleLine size={17} />} Submit Proof & Finish
                </Btn>
              </>}

              {workStatus === "completed" && (
                <ProviderPaymentSection
                  assignmentId={assignmentId}
                  jobTitle={assignment.job.title}
                  clientName={assignment.job.clientName}
                />
              )}

              {workStatus === "completed" && <>
                <Btn variant="primary" onClick={() => {
                  if (myReview) {
                    setEditReviewState({
                      isEdit: true,
                      initialRating: myReview.rating,
                      initialComment: myReview.comment,
                      initialImages: myReview.images
                    });
                  } else {
                    setEditReviewState({ isEdit: false });
                  }
                  setIsReviewModalOpen(true);
                }} disabled={actionLoading}>
                  <RiStarLine size={16} /> {myReview ? "Edit Your Review" : "Leave a Review"}
                </Btn>
                <Btn variant="danger" onClick={() => setIsReportModalOpen(true)} disabled={actionLoading}>
                  <RiErrorWarningLine size={16} /> Report Issue
                </Btn>
              </>}

              <Btn variant="ghost" onClick={() => setIsLogModalOpen(true)}>
                <RiHistoryLine size={16} /> View Activity Log
              </Btn>

              {workStatus !== "completed" && workStatus !== "cancelled" && (
                <Btn variant="danger" onClick={() => setIsCancelModalOpen(true)} disabled={actionLoading}>
                  <RiCloseLine size={16} /> Cancel Assignment
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>

      <SubmitProofModal isOpen={isProofModalOpen} onClose={() => setIsProofModalOpen(false)} onSubmit={handleProof} jobTitle={job.title} />
      <JobLogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} assignment={assignment} />
      <CancellationModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} onConfirm={handleCancel} type="provider" />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditReviewState({ isEdit: false });
        }}
        onSubmit={handleReview}
        clientName={job.clientName}
        isEdit={editReviewState.isEdit}
        initialRating={editReviewState.initialRating}
        initialComment={editReviewState.initialComment}
        initialImages={editReviewState.initialImages}
      />
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSubmit={handleReport} clientName={job.clientName} />
      <ClientProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}
        client={{ name: job.clientName, email: job.clientEmail, phone: job.clientNumber, initials: job.clientInitials, avatarUrl: job.clientAvatarUrl, isVerified: job.isClientVerified }} />

      <UniversalActionModal
        isOpen={!!confirmModal?.isOpen}
        onClose={() => setConfirmModal(null)}
        onConfirm={() => {
          if (confirmModal?.type === "confirm_receipt") handleConfirmPayment();
          else if (confirmModal?.type === "mark_paid") handleMarkAsPaid();
          else if (confirmModal?.type === "reject") handleRejectPayment();
          else if (confirmModal?.type === "delete_review") handleDeleteReview();
        }}
        title={
          confirmModal?.type === "confirm_receipt" ? "Confirm Payment Receipt" :
            confirmModal?.type === "mark_paid" ? "Mark as Paid by Cash" :
              confirmModal?.type === "delete_review" ? "Delete Review" :
                "Reject Payment Confirmation"
        }
        message={
          confirmModal?.type === "confirm_receipt" ? "Are you sure you have received the cash payment from the client?" :
            confirmModal?.type === "mark_paid" ? "Are you sure you want to mark this job as paid by cash? This will finalize the payment." :
              confirmModal?.type === "delete_review" ? "Are you sure you want to delete your review? This action cannot be undone." :
                "Are you sure you want to reject this payment confirmation? The payment status will return to pending."
        }
        confirmLabel={
          confirmModal?.type === "confirm_receipt" ? "Yes, Received" :
            confirmModal?.type === "mark_paid" ? "Yes, Mark Paid" :
              confirmModal?.type === "delete_review" ? "Yes, Delete" :
                "Yes, Reject"
        }
        iconType={confirmModal?.type === "reject" || confirmModal?.type === "delete_review" ? "warning" : "success"}
      />

      <style>{`
        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @media (max-width:991px) {
          .adp-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AssignmentDetailPage;
