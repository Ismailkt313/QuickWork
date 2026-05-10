import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getJobDetails,
  getJobAssignments,
  cancelAssignmentByClient,
  reportAbsence,
  submitReview,
  submitReport,
  cancelJob,
  markAsPaidByCash,
  getReviewsForAssignment,
  updateReview,
  deleteReview,
} from "../services/userJob.service";
import ReviewModal from "../components/ReviewModal";
import ReportIssueModal from "../components/ReportIssueModal";
import { CancelJobModal } from "../components/CancelJobModal";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  RiArrowLeftLine,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiCalendarCheckLine,
  RiGroupLine,
  RiMessage2Line,
  RiLoader4Line,
  RiErrorWarningLine,
  RiStarLine,
  RiStarFill,
  RiFlagLine,
  RiCheckboxCircleLine,
  RiFocus2Line,
  RiWallet3Line,
  RiHandCoinLine,
  RiTimeLine,
  RiCashLine,
} from "react-icons/ri";
import CancellationModal from "../../provider/components/CancellationModal";
import ReportAbsenceModal from "../../provider/components/ReportAbsenceModal";
import UniversalActionModal from "../../provider/components/UniversalActionModal";
import ClientJobPaymentSection from "../../finance/components/ClientJobPaymentSection";
import {
  financeService,
  type WorkHistory,
} from "../../finance/services/finance.service";
import { AxiosError } from "axios";

interface JobDetail {
  jobCode: string;
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: "public" | "private";
  location: { address: string } | null;
  budget: string;
  skills: string[];
  startDate: string;
  durationType: string;
  rejectionReason?: string;
  freelancersNeeded: number;
  acceptedFreelancers: number;
  hiredProvider?: {
    userId: string;
    name: string;
    headline: string;
    profileImage: string;
    isVerified?: boolean;
    workStatus: string;
    assignmentId: string;
    payment?: {
      status: string;
      amount: number;
      method?: string;
    };
  };
  assignments?: {
    assignmentId: string;
    workStatus: string;
    provider: {
      userId: string;
      name: string;
      headline: string;
      profileImage: string;
      isVerified?: boolean;
    };
    payment?: {
      status: string;
      amount: number;
      method?: string;
    };
  }[];
}

interface Assignment {
  assignmentId: string;
  workStatus: string;
  payment?: {
    status: string;
    amount: number;
    method?: string;
  };
  provider: {
    userId: string;
    name: string;
    headline: string;
    profileImage: string;
    isVerified?: boolean;
  };
}

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

// ─── Shared Helpers ───

const renderReviewCard = (
  assignmentId: string,
  providerName: string,
  providerId: string,
  assignmentReviews: Record<string, Review>,
  setSelectedAssignmentId: (id: string | null) => void,
  setSelectedProviderId: (id: string | null) => void,
  setSelectedProviderName: (name: string) => void,
  setEditReviewState: (state: {
    isEdit: boolean;
    reviewId?: string;
    initialRating?: number;
    initialComment?: string;
    initialImages?: string[];
  }) => void,
  setIsReviewModalOpen: (open: boolean) => void,
  handleDeleteReviewClick: (id: string, assignmentId: string) => void,
) => {
  const review = assignmentReviews[assignmentId];
  if (!review) return null;

  return (
    <div className="qw-review-card-mini mt-3 p-3 rounded-4 border bg-light shadow-sm">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex text-warning">
            {[...Array(5)].map((_, i) =>
              i < review.rating ? (
                <RiStarFill key={i} size={14} />
              ) : (
                <RiStarLine key={i} size={14} />
              ),
            )}
          </div>
          <span className="small text-muted fw-bold">
            {new Date(review.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-link p-0 text-primary fw-bold text-decoration-none"
            style={{ fontSize: "12px" }}
            onClick={() => {
              setSelectedAssignmentId(assignmentId);
              setSelectedProviderId(providerId);
              setSelectedProviderName(providerName);
              setEditReviewState({
                isEdit: true,
                reviewId: review.id,
                initialRating: review.rating,
                initialComment: review.comment,
                initialImages: review.images,
              });
              setIsReviewModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-link p-0 text-danger fw-bold text-decoration-none"
            style={{ fontSize: "12px" }}
            onClick={() => handleDeleteReviewClick(review.id, assignmentId)}
          >
            Delete
          </button>
        </div>
      </div>
      <p className="small text-dark mb-2 fw-medium">{review.comment}</p>
      {review.images && review.images.length > 0 && (
        <div className="d-flex gap-2 overflow-auto pb-1 qw-mini-images">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt="review"
              className="rounded-2 shadow-sm border"
              style={{ width: 44, height: 44, objectFit: "cover" }}
            />
          ))}
        </div>
      )}
      <style>{`
        .qw-mini-images::-webkit-scrollbar { height: 4px; }
        .qw-mini-images::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

const UserJobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [paymentHistories, setPaymentHistories] = useState<
    Record<string, WorkHistory>
  >({});

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isJobCancelModalOpen, setIsJobCancelModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignmentReviews, setAssignmentReviews] = useState<
    Record<string, Review>
  >({});
  const [editReviewState, setEditReviewState] = useState<{
    isEdit: boolean;
    reviewId?: string;
    initialRating?: number;
    initialComment?: string;
    initialImages?: string[];
  }>({ isEdit: false });
  const [isDeleteReviewModalOpen, setIsDeleteReviewModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<{
    id: string;
    assignmentId: string;
  } | null>(null);

  const hasAwaitingPayment = React.useMemo(() => {
    if (job?.hiredProvider?.payment?.status === "awaiting_confirmation")
      return true;
    return assignments.some(
      (a) => a.payment?.status === "awaiting_confirmation",
    );
  }, [job, assignments]);

  const handleCancelAssignment = async (notes: string) => {
    if (!selectedAssignmentId) return;
    try {
      setLoading(true);
      const response = await cancelAssignmentByClient(
        selectedAssignmentId,
        notes,
      );
      if (response.success) {
        toast.success("Assignment cancelled successfully");
        fetchData();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to cancel assignment",
      );
    } finally {
      setLoading(false);
      setSelectedAssignmentId(null);
    }
  };

  const handleCancelJob = async () => {
    setIsJobCancelModalOpen(true);
  };

  const confirmCancelJob = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const response = await cancelJob(jobId);
      if (response.success) {
        toast.success("Job offer cancelled successfully");
        fetchData();
        setIsJobCancelModalOpen(false);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to cancel job");
    } finally {
      setLoading(false);
    }
  };

  const handleReportAbsence = async (notes: string, evidence: string[]) => {
    if (!selectedAssignmentId) return;
    try {
      setLoading(true);
      const response = await reportAbsence(
        selectedAssignmentId,
        notes,
        evidence,
      );
      if (response.success) {
        toast.success("Absence reported successfully");
        fetchData();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to report absence",
      );
    } finally {
      setLoading(false);
      setSelectedAssignmentId(null);
    }
  };

  const handleReviewSubmit = async (
    rating: number,
    comment: string,
    images: string[],
  ) => {
    if (!selectedAssignmentId || !selectedProviderId) return;
    try {
      setLoading(true);
      let response;
      if (editReviewState.isEdit && editReviewState.reviewId) {
        response = await updateReview(editReviewState.reviewId, {
          rating,
          comment,
          images,
        });
      } else {
        response = await submitReview({
          assignmentId: selectedAssignmentId,
          revieweeId: selectedProviderId,
          rating,
          comment,
          images,
          role: "client_to_provider",
        });
      }

      toast.success(response.message || "Review processed successfully");
      setIsReviewModalOpen(false);
      setEditReviewState({ isEdit: false });
      fetchData(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const status = axiosError.response?.status;
      const message =
        axiosError.message || "An unexpected error occurred during review";

      if (status === 409) {
        toast.warning(
          "You have already submitted a review for this provider on this assignment.",
          {
            autoClose: 5000,
          },
        );
        setIsReviewModalOpen(false);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReviewClick = (reviewId: string, assignmentId: string) => {
    setReviewToDelete({ id: reviewId, assignmentId });
    setIsDeleteReviewModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    const { id, assignmentId } = reviewToDelete;
    try {
      setLoading(true);
      await deleteReview(id);
      toast.success("Review deleted successfully");
      setAssignmentReviews((prev) => {
        const next = { ...prev };
        delete next[assignmentId];
        return next;
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to delete review",
      );
    } finally {
      setLoading(false);
      setIsDeleteReviewModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleReportSubmit = async (
    reason: string,
    description: string,
    images: string[],
  ) => {
    if (!selectedAssignmentId || !selectedProviderId) return;
    try {
      setLoading(true);
      const response = await submitReport({
        assignmentId: selectedAssignmentId,
        reportedUserId: selectedProviderId,
        reason,
        description,
        images,
        role: "client_to_provider",
      });
      toast.success(response.message || "Report submitted successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
        "An unexpected error occurred during report",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (assignmentId: string) => {
    try {
      setLoading(true);
      const response = await markAsPaidByCash(assignmentId);
      if (response.success) {
        toast.success(
          "Payment marked as paid by cash. Awaiting provider confirmation.",
        );
        fetchData(true);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Failed to mark as paid",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistories = useCallback(async (assignmentIds: string[]) => {
    const histories: Record<string, WorkHistory> = {};
    await Promise.all(
      assignmentIds.map(async (aId) => {
        try {
          const res = await financeService.getWorkHistoryByAssignmentId(aId);
          if (res.data) histories[aId] = res.data;
        } catch (error) {
          console.error(
            `Failed to fetch payment history for assignment ${aId}:`,
            error,
          );
        }
      }),
    );
    setPaymentHistories(histories);
  }, []);

  const fetchAssignmentReviews = useCallback(
    async (assignmentIds: string[]) => {
      const reviews: Record<string, Review> = {};
      await Promise.all(
        assignmentIds.map(async (aId) => {
          try {
            const res = await getReviewsForAssignment(aId);
            if (res.success && res.data && res.data.length > 0) {
              const clientReview = res.data.find(
                (r: Review) => r.role === "client_to_provider",
              );
              if (clientReview) reviews[aId] = clientReview;
            }
          } catch (error) {
            console.error(
              `Failed to fetch reviews for assignment ${aId}:`,
              error,
            );
          }
        }),
      );
      setAssignmentReviews((prev) => {
        const next = { ...prev };
        assignmentIds.forEach((id) => {
          if (reviews[id]) next[id] = reviews[id];
          else delete next[id];
        });
        return next;
      });
    },
    [],
  );

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDirectHire = job?.visibility === "private";
  const isRejected = job?.status === "rejected";

  const fetchData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        const jobRes = await getJobDetails(jobId!);
        if (jobRes.success) {
          setJob(jobRes.data);
          const completedAssignmentIds: string[] = [];
          if (jobRes.data.visibility === "public") {
            const assignRes = await getJobAssignments(jobId!);
            if (assignRes.success) {
              setAssignments(assignRes.data);
              assignRes.data.forEach((a: Assignment) => {
                if (a.workStatus === "completed")
                  completedAssignmentIds.push(a.assignmentId);
              });
            }
          } else if (jobRes.data.hiredProvider?.assignmentId) {
            const hp = jobRes.data.hiredProvider;
            if (hp.workStatus === "completed")
              completedAssignmentIds.push(hp.assignmentId);
          }
          if (completedAssignmentIds.length > 0) {
            fetchPaymentHistories(completedAssignmentIds);
            fetchAssignmentReviews(completedAssignmentIds);
          }
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
        toast.error(
          axiosError.response?.data?.message || "Failed to load data",
        );
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [jobId, fetchPaymentHistories, fetchAssignmentReviews],
  );

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId, fetchData]);

  const handleTextProvider = (providerId: string, providerName: string) => {
    navigate(
      `/user/messages?userId=${providerId}&name=${encodeURIComponent(providerName)}`,
    );
  };

  // ─── Mobile Specific Components ───

  const MobileJobHeader = () => (
    <div className="m-job-header">
      <button onClick={() => navigate("/user/jobs")} className="m-back-btn">
        <RiArrowLeftLine size={20} />
      </button>
      <div className="m-header-info">
        <h1 className="m-job-title">{job?.title}</h1>
        <div className="m-status-row">
          <span className={`m-status-chip ${job?.status}`}>
            {job?.status.replace("_", " ")}
          </span>
          <span className="m-type-chip">
            {job?.visibility === "private" ? "Direct" : "Public"}
          </span>
        </div>
      </div>
      <button className="m-more-btn">
        <RiFlagLine size={18} />
      </button>
    </div>
  );

  const JobSummaryCard = () => (
    <div className="m-summary-card">
      <div className="m-budget-row">
        <div className="m-budget-info">
          <span className="m-label">Project Budget</span>
          <span className="m-value">₹{job?.budget}</span>
        </div>
        <RiMoneyDollarCircleLine size={32} className="m-budget-icon" />
      </div>
      <div className="m-stats-grid">
        <div className="m-stat-item">
          <RiMapPinLine className="m-stat-icon" />
          <div className="m-stat-text">
            <span className="m-stat-label">Location</span>
            <span className="m-stat-val">
              {job?.location?.address || "Remote"}
            </span>
          </div>
        </div>
        <div className="m-stat-item">
          <RiCalendarCheckLine className="m-stat-icon" />
          <div className="m-stat-text">
            <span className="m-stat-label">Start Date</span>
            <span className="m-stat-val">{job?.startDate}</span>
          </div>
        </div>
        <div className="m-stat-item">
          <RiTimeLine className="m-stat-icon" />
          <div className="m-stat-text">
            <span className="m-stat-label">Duration</span>
            <span className="m-stat-val text-capitalize">
              {job?.durationType.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="m-stat-item">
          <RiGroupLine className="m-stat-icon" />
          <div className="m-stat-text">
            <span className="m-stat-label">Providers</span>
            <span className="m-stat-val">
              {job?.acceptedFreelancers} / {job?.freelancersNeeded}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const MobileProviderCard = ({
    assignment,
    provider,
  }: {
    assignment?: Assignment;
    provider?: JobDetail["hiredProvider"];
  }) => {
    const p = provider || assignment?.provider;
    const workStatus = assignment?.workStatus || provider?.workStatus;
    const aid = assignment?.assignmentId || provider?.assignmentId;
    const payment = assignment?.payment || provider?.payment;

    if (!p || !aid) return null;
    const assignmentId: string = aid;

    return (
      <div className="m-provider-section">
        <div className="m-provider-card">
          <div className="m-p-main">
            <img
              src={p.profileImage || "https://via.placeholder.com/150"}
              alt={p.name}
              className="m-p-avatar"
            />
            <div className="m-p-info">
              <h4 className="m-p-name">{p.name}</h4>
              <p className="m-p-headline">
                {p.headline || "Professional Provider"}
              </p>
              <div className="m-p-badges">
                <span className={`m-work-status ${workStatus}`}>
                  {workStatus?.replace("_", " ")}
                </span>
                {payment && (
                  <span className={`m-pay-status ${payment.status}`}>
                    ₹{payment.amount}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="m-p-actions">
            <button
              className="m-p-btn chat"
              onClick={() => handleTextProvider(p.userId, p.name)}
            >
              <RiMessage2Line />
            </button>
            {workStatus === "completed" && !assignmentReviews[assignmentId] && (
              <button
                className="m-p-btn star"
                onClick={() => {
                  setSelectedAssignmentId(assignmentId);
                  setSelectedProviderId(p.userId);
                  setSelectedProviderName(p.name);
                  setIsReviewModalOpen(true);
                }}
              >
                <RiStarLine />
              </button>
            )}
            <button
              className="m-p-btn report"
              onClick={() => {
                setSelectedAssignmentId(assignmentId);
                setSelectedProviderId(p.userId);
                setSelectedProviderName(p.name);
                setIsReportModalOpen(true);
              }}
            >
              <RiFlagLine />
            </button>
          </div>
        </div>

        {workStatus === "completed" && (
          <div className="m-financial-details">
            <ClientJobPaymentSection
              assignmentId={assignmentId}
              providerName={p.name}
            />
            {renderReviewCard(
              assignmentId,
              p.name,
              p.userId,
              assignmentReviews,
              setSelectedAssignmentId,
              setSelectedProviderId,
              setSelectedProviderName,
              setEditReviewState,
              setIsReviewModalOpen,
              handleDeleteReviewClick,
            )}
          </div>
        )}
      </div>
    );
  };

  const StickyActionBar = () => {
    if (job?.status === "completed" || job?.status === "cancelled") return null;

    return (
      <div className="m-sticky-actions">
        {job?.status === "open" && isDirectHire && !hasAwaitingPayment && (
          <button className="m-action-btn cancel" onClick={handleCancelJob}>
            Cancel Offer
          </button>
        )}
        <button
          className="m-action-btn primary"
          onClick={() => navigate(`/user/jobs`)}
        >
          Manage Job
        </button>
      </div>
    );
  };

  const MobileLayout = () => (
    <div className="m-job-detail-page">
      <MobileJobHeader />

      <div className="m-scroll-content">
        {hasAwaitingPayment && (
          <div className="m-lock-notice">
            <RiLoader4Line className="qw-spin" />
            <p>
              <strong>Job Locked:</strong> Marked as paid. Awaiting
              confirmation.
            </p>
          </div>
        )}

        <JobSummaryCard />

        <div className="m-section">
          <h3 className="m-section-title">Description</h3>
          <p className="m-job-desc">{job?.description}</p>
        </div>

        <div className="m-section">
          <h3 className="m-section-title">
            {isDirectHire ? "Hired Provider" : "Assigned Providers"}
          </h3>
          {isDirectHire ? (
            job?.hiredProvider ? (
              <MobileProviderCard provider={job?.hiredProvider} />
            ) : (
              <div className="m-empty">Unavailable</div>
            )
          ) : assignments.length > 0 ? (
            <div className="m-providers-list">
              {assignments.map((a) => (
                <MobileProviderCard key={a.assignmentId} assignment={a} />
              ))}
            </div>
          ) : (
            <div className="m-empty">No providers assigned yet.</div>
          )}
        </div>

        <div className="m-section">
          <h3 className="m-section-title">Timeline</h3>
          <div className="m-timeline-card">
            {[
              { label: "Job Created", date: "Done", active: true },
              {
                label: "Provider Assigned",
                date: job?.acceptedFreelancers ? "Done" : "Pending",
                active: !!job?.acceptedFreelancers,
              },
              {
                label: "Work In Progress",
                date: job?.status === "in_progress" ? "Active" : "-",
                active: job?.status === "in_progress",
              },
              {
                label: "Completion",
                date: job?.status === "completed" ? "Done" : "-",
                active: job?.status === "completed",
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`m-timeline-step ${step.active ? "active" : ""}`}
              >
                <div className="m-step-indicator" />
                <div className="m-step-content">
                  <span className="m-step-label">{step.label}</span>
                  <span className="m-step-date">{step.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StickyActionBar />

      <style>{`
        .m-job-detail-page {
          background: #f8fafc;
          min-height: 100vh;
          padding-bottom: 180px; /* Increased to prevent content from hiding behind sticky actions */
        }
        .m-job-header {
          background: white;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .m-back-btn, .m-more-btn {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }
        .m-header-info { flex: 1; min-width: 0; }
        .m-job-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .m-status-row {
          display: flex;
          gap: 6px;
          margin-top: 2px;
        }
        .m-status-chip {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .m-status-chip.open { background: #fff7ed; color: #f97316; }
        .m-status-chip.completed { background: #f0fdf4; color: #16a34a; }
        .m-type-chip {
          font-size: 9px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .m-summary-card {
          margin: 16px;
          background: white;
          border-radius: 24px;
          padding: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
        }
        .m-budget-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px dashed #f1f5f9;
        }
        .m-budget-info { display: flex; flex-direction: column; }
        .m-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .m-value { font-size: 24px; font-weight: 800; color: #0f172a; }
        .m-budget-icon { color: #3b82f6; opacity: 0.2; }

        .m-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .m-stat-item { display: flex; gap: 10px; align-items: flex-start; }
        .m-stat-icon { color: #94a3b8; font-size: 16px; margin-top: 2px; }
        .m-stat-text { display: flex; flex-direction: column; min-width: 0; }
        .m-stat-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .m-stat-val { font-size: 13px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .m-section { padding: 16px 20px; }
        .m-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .m-job-desc { font-size: 14px; line-height: 1.6; color: #64748b; margin: 0; }

        .m-provider-section {
          background: white;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          margin-bottom: 12px;
          overflow: hidden;
        }
        .m-provider-card {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .m-p-main { display: flex; gap: 12px; align-items: center; }
        .m-p-avatar { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; }
        .m-p-name { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }
        .m-p-headline { font-size: 12px; color: #94a3b8; margin: 0; }
        .m-p-badges { display: flex; gap: 4px; margin-top: 4px; }
        .m-work-status { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #3b82f6; text-transform: uppercase; }
        .m-pay-status { font-size: 9px; font-weight: 800; color: #64748b; }
        
        .m-p-actions { display: flex; gap: 8px; }
        .m-p-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .m-financial-details {
          padding: 16px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
        }

        .m-timeline-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #f1f5f9;
        }
        .m-timeline-step {
          display: flex;
          gap: 16px;
          padding-bottom: 20px;
          position: relative;
        }
        .m-timeline-step:last-child { padding-bottom: 0; }
        .m-timeline-step::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 10px;
          bottom: 0;
          width: 2px;
          background: #f1f5f9;
        }
        .m-timeline-step:last-child::before { display: none; }
        .m-timeline-step.active::before { background: #3b82f6; }
        
        .m-step-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e2e8f0;
          border: 3px solid white;
          box-shadow: 0 0 0 1px #f1f5f9;
          z-index: 1;
          margin-top: 4px;
        }
        .m-timeline-step.active .m-step-indicator { background: #3b82f6; }
        .m-step-content { display: flex; flex-direction: column; }
        .m-step-label { font-size: 13px; font-weight: 700; color: #0f172a; }
        .m-step-date { font-size: 11px; color: #94a3b8; }

        .m-sticky-actions {
          position: fixed;
          bottom: calc(64px + env(safe-area-inset-bottom, 12px));
          left: 0;
          right: 0;
          background: white;
          padding: 16px 20px;
          display: flex;
          gap: 12px;
          border-top: 1px solid #f1f5f9;
          box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.05);
          z-index: 990; /* Reduced to ensure it sits behind modals (9999) */
        }
        .m-action-btn {
          flex: 1;
          height: 48px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 700;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .m-action-btn.primary { background: #0f172a; color: white; }
        .m-action-btn.cancel { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }

        .m-lock-notice {
          margin: 16px;
          padding: 12px 16px;
          background: #eff6ff;
          border-radius: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
          color: #3b82f6;
        }
        .m-lock-notice p { font-size: 12px; margin: 0; font-weight: 500; }
      `}</style>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <div
      className="qw-page-container"
      style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <Link
        to="/user/jobs"
        className="text-decoration-none text-muted d-inline-flex align-items-center gap-2 mb-4 hover-text-primary transition-all fw-medium"
      >
        <RiArrowLeftLine /> Back to My Jobs
      </Link>
      {hasAwaitingPayment && (
        <div className="alert alert-info border-0 shadow-sm rounded-4 p-3 mb-4 d-flex align-items-center gap-3">
          <RiLoader4Line className="qw-spin text-info" size={24} />
          <div className="small fw-medium text-info-emphasis">
            <strong>Job Locked:</strong> You have marked a payment as paid. Job
            details and cancellations are restricted until the provider confirms
            the receipt.
          </div>
        </div>
      )}
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-f1f5f9 mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <span
                className={`badge rounded-pill bg-${job?.status === "open"
                    ? "warning text-dark"
                    : job?.status === "rejected" || job?.status === "cancelled"
                      ? "danger"
                      : job?.status === "completed"
                        ? "success"
                        : "primary"
                  }-subtle text-${job?.status === "open"
                    ? "warning text-dark"
                    : job?.status === "rejected" || job?.status === "cancelled"
                      ? "danger"
                      : job?.status === "completed"
                        ? "success"
                        : "primary"
                  } px-3 py-2 fw-bold text-uppercase`}
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                {job?.status?.replace("_", " ")}
              </span>
              <span
                className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-bold text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                {isDirectHire ? "Direct Hire" : "Public Hire"}
              </span>
              {job?.jobCode && (
                <span
                  className="badge rounded-pill bg-secondary text-white px-3 py-2 fw-bold text-uppercase"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.5px",
                    background: "#64748b",
                  }}
                >
                  #{job?.jobCode}
                </span>
              )}
            </div>
            <h1
              className="fw-bold text-dark mb-1"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-1px" }}
            >
              {job?.title}
            </h1>
            <div className="d-flex align-items-center gap-2 mb-3">
              <RiFocus2Line className="text-primary" size={18} />
              <span className="fw-bold text-primary small text-uppercase letter-spacing-1">
                {job?.skills && job?.skills.length > 0
                  ? job?.skills[0]
                  : "General Service"}
              </span>
            </div>
            <p
              className="text-muted fs-5 mb-0"
              style={{ maxWidth: "800px", lineHeight: "1.6" }}
            >
              {job?.description}
            </p>
          </div>
        </div>

        <div className="row g-4 border-top pt-4">
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiMapPinLine className="me-1" /> Location
            </div>
            <div className="fw-semibold text-dark fs-6">
              {job?.location?.address || "Remote"}
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiMoneyDollarCircleLine className="me-1" /> Budget
            </div>
            <div className="fw-semibold text-dark fs-6">₹{job?.budget}</div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiCalendarCheckLine className="me-1" /> Start Date
            </div>
            <div className="fw-semibold text-dark fs-6">{job?.startDate}</div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiGroupLine className="me-1" /> Duration Type
            </div>
            <div className="fw-semibold text-dark fs-6 text-capitalize">
              {job?.durationType?.replace("_", " ")}
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiGroupLine className="me-1" /> Providers
            </div>
            <div className="fw-semibold text-dark fs-6">
              {job?.acceptedFreelancers} / {job?.freelancersNeeded} Assigned
            </div>
          </div>
        </div>
      </div>

      {(() => {
        const allAssignmentIds: string[] = [];
        if (
          job?.visibility === "private" &&
          job?.hiredProvider?.assignmentId &&
          job?.hiredProvider?.workStatus === "completed"
        ) {
          allAssignmentIds.push(job?.hiredProvider?.assignmentId);
        } else {
          assignments
            .filter((a) => a.workStatus === "completed")
            .forEach((a) => allAssignmentIds.push(a.assignmentId));
        }
        const histories = allAssignmentIds
          .map((id) => paymentHistories[id])
          .filter(Boolean);
        if (histories.length === 0) return null;

        const totalBudget = histories.reduce(
          (s, h) => s + h.payment.totalAmount,
          0,
        );
        const totalPaid = histories
          .filter((h) => h.payment.status === "completed")
          .reduce((s, h) => s + h.payment.totalAmount, 0);
        const totalPending = histories
          .filter((h) => h.payment.status !== "completed")
          .reduce((s, h) => s + h.payment.totalAmount, 0);
        const totalFees = histories.reduce(
          (s, h) => s + h.payment.platformFee,
          0,
        );

        return (
          <div className="qw-payment-summary-card mb-4">
            <div className="qw-ps-header">
              <div className="qw-ps-icon-box">
                <RiWallet3Line size={22} />
              </div>
              <div>
                <h4 className="qw-ps-title">Payment Summary</h4>
                <p className="qw-ps-subtitle">
                  {histories.length} provider{histories.length > 1 ? "s" : ""} •{" "}
                  {
                    histories.filter((h) => h.payment.status === "completed")
                      .length
                  }{" "}
                  paid
                </p>
              </div>
            </div>

            <div className="qw-ps-stats-grid">
              <div className="qw-ps-stat">
                <div className="qw-ps-stat-icon total">
                  <RiMoneyDollarCircleLine size={18} />
                </div>
                <div className="qw-ps-stat-info">
                  <span className="qw-ps-stat-label">Total Amount</span>
                  <span className="qw-ps-stat-value">
                    ₹{totalBudget.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="qw-ps-stat">
                <div className="qw-ps-stat-icon paid">
                  <RiCheckboxCircleLine size={18} />
                </div>
                <div className="qw-ps-stat-info">
                  <span className="qw-ps-stat-label">Paid</span>
                  <span className="qw-ps-stat-value success">
                    ₹{totalPaid.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="qw-ps-stat">
                <div className="qw-ps-stat-icon pending">
                  <RiTimeLine size={18} />
                </div>
                <div className="qw-ps-stat-info">
                  <span className="qw-ps-stat-label">Pending</span>
                  <span className="qw-ps-stat-value warning">
                    ₹{totalPending.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="qw-ps-stat">
                <div className="qw-ps-stat-icon fee">
                  <RiHandCoinLine size={18} />
                </div>
                <div className="qw-ps-stat-info">
                  <span className="qw-ps-stat-label">Platform Fee</span>
                  <span className="qw-ps-stat-value muted">
                    ₹{totalFees.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="qw-ps-progress-wrap">
              <div className="qw-ps-progress-bar">
                <div
                  className="qw-ps-progress-fill"
                  style={{
                    width:
                      totalBudget > 0
                        ? `${(totalPaid / totalBudget) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <span className="qw-ps-progress-label">
                {totalBudget > 0
                  ? Math.round((totalPaid / totalBudget) * 100)
                  : 0}
                % paid
              </span>
            </div>

            {histories.length > 1 && (
              <div className="qw-ps-breakdown">
                <h6 className="qw-ps-breakdown-title">Provider Breakdown</h6>
                {histories.map((h) => {
                  const provider = assignments.find(
                    (a) =>
                      a.assignmentId ===
                      Object.keys(paymentHistories).find(
                        (k) => paymentHistories[k]?._id === h._id,
                      ),
                  );
                  return (
                    <div key={h._id} className="qw-ps-breakdown-row">
                      <div className="qw-ps-breakdown-name">
                        <div className="qw-ps-mini-avatar">
                          {(provider?.provider.name || h.jobId.title || "P")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span>{provider?.provider.name || h.jobId.title}</span>
                      </div>
                      <div className="qw-ps-breakdown-amount">
                        <span className="qw-ps-amount-value">
                          ₹{h.payment.totalAmount.toLocaleString()}
                        </span>
                        <span
                          className={`qw-ps-method-tag ${h.payment.status}`}
                        >
                          {h.payment.status === "completed" ? (
                            <>
                              <RiCheckboxCircleLine size={12} /> Paid
                            </>
                          ) : h.payment.status === "awaiting_confirmation" ? (
                            <>
                              <RiTimeLine size={12} /> Awaiting
                            </>
                          ) : (
                            <>
                              <RiCashLine size={12} /> Pending
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {isDirectHire && isRejected && (
        <div
          className="alert alert-danger d-flex gap-3 align-items-start p-4 rounded-4 mb-4 border-0 shadow-sm"
          style={{ backgroundColor: "#fef2f2" }}
        >
          <RiErrorWarningLine
            size={24}
            className="text-danger flex-shrink-0 mt-1"
          />
          <div>
            <h5 className="fw-bold text-danger mb-2">Offer Declined</h5>
            <p className="mb-0 text-danger" style={{ opacity: 0.9 }}>
              The provider has declined your direct hire offer.
              <br />
              <br />
              <strong className="d-block mb-1">Message from provider:</strong>
              <em
                className="bg-white d-inline-block p-3 rounded-3 shadow-sm border mt-1"
                style={{ color: "#475569", fontStyle: "normal" }}
              >
                "{job?.rejectionReason || "No reason provided."}"
              </em>
            </p>
          </div>
        </div>
      )}

      <h3 className="fw-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
        {isDirectHire ? "Hired Provider" : "Assigned Providers"}
      </h3>

      {isDirectHire ? (
        job?.hiredProvider ? (
          (() => {
            const hp = job?.hiredProvider;
            return (
              <div className="provider-card mb-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-4">
                  <div className="d-flex align-items-center gap-4">
                    <div className="position-relative">
                      <img
                        src={
                          hp.profileImage || "https://via.placeholder.com/150"
                        }
                        alt={hp.name}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "24px",
                        }}
                        className="shadow-sm border border-2 border-white"
                      />
                      <div
                        className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle"
                        style={{ width: "14px", height: "14px" }}
                      ></div>
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h4
                          className="fw-bold mb-0 text-dark"
                          style={{ fontFamily: "Syne, sans-serif" }}
                        >
                          {hp.name}
                        </h4>
                        {hp.isVerified && (
                          <RiCheckboxCircleLine
                            className="text-primary"
                            size={18}
                          />
                        )}
                      </div>
                      <p className="text-muted mb-2 small fw-medium">
                        {hp.headline || "Professional Service Provider"}
                      </p>
                      <div className="d-flex gap-2">
                        <span
                          className={`status-chip ${hp.workStatus === "completed"
                              ? "bg-success-subtle text-success"
                              : hp.workStatus === "in_progress"
                                ? "bg-warning-subtle text-warning"
                                : "bg-info-subtle text-info"
                            }`}
                        >
                          {hp.workStatus?.replace("_", " ") || "Assigned"}
                        </span>
                        {job?.status === "open" && (
                          <span className="status-chip bg-amber-50 text-amber-600">
                            Pending Response
                          </span>
                        )}
                        {hp.payment && (
                          <span
                            className={`status-chip ${hp.payment.status === "completed"
                                ? "bg-success-subtle text-success"
                                : hp.payment.status === "awaiting_confirmation"
                                  ? "bg-warning-subtle text-warning"
                                  : "bg-secondary-subtle text-secondary"
                              }`}
                          >
                            <RiMoneyDollarCircleLine
                              size={12}
                              className="me-1"
                            />
                            ₹{hp.payment.amount} •{" "}
                            {hp.payment.status === "completed"
                              ? "Paid"
                              : hp.payment.status?.includes("awaiting")
                                ? "Awaiting"
                                : "Unpaid"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="action-btn-circle"
                      title="Message"
                      onClick={() => handleTextProvider(hp.userId, hp.name)}
                    >
                      <RiMessage2Line size={20} />
                    </button>
                    {hp.workStatus === "completed" &&
                      !assignmentReviews[hp.assignmentId] && (
                        <>
                          <button
                            className="action-btn-circle hover-text-primary"
                            title="Write Review"
                            onClick={() => {
                              setSelectedAssignmentId(hp.assignmentId);
                              setSelectedProviderId(hp.userId);
                              setSelectedProviderName(hp.name);
                              setIsReviewModalOpen(true);
                            }}
                          >
                            <RiStarLine size={20} />
                          </button>
                        </>
                      )}
                    <button
                      className="action-btn-circle hover-text-danger"
                      title="Report Issue"
                      onClick={() => {
                        setSelectedAssignmentId(hp.assignmentId);
                        setSelectedProviderId(hp.userId);
                        setSelectedProviderName(hp.name);
                        setIsReportModalOpen(true);
                      }}
                    >
                      <RiFlagLine size={20} />
                    </button>
                    {job?.status === "open" &&
                      isDirectHire &&
                      !hasAwaitingPayment && (
                        <button
                          className="btn btn-link text-danger text-decoration-none small fw-bold px-3"
                          onClick={handleCancelJob}
                        >
                          Cancel Offer
                        </button>
                      )}
                  </div>
                </div>

                {hp.workStatus === "completed" && (
                  <div className="pt-4 mt-2 border-top border-f1f5f9">
                    <ClientJobPaymentSection
                      assignmentId={hp.assignmentId}
                      providerName={hp.name}
                    />
                    {renderReviewCard(
                      hp.assignmentId,
                      hp.name,
                      hp.userId,
                      assignmentReviews,
                      setSelectedAssignmentId,
                      setSelectedProviderId,
                      setSelectedProviderName,
                      setEditReviewState,
                      setIsReviewModalOpen,
                      handleDeleteReviewClick
                    )}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">
            Provider details unavailable.
          </div>
        )
      ) : assignments.length > 0 ? (
        <div className="row g-4">
          {assignments.map((assignment) => (
            <div key={assignment.assignmentId} className="col-12 col-xl-6">
              <div className="provider-card h-100">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="position-relative">
                      <img
                        src={
                          assignment.provider.profileImage ||
                          "https://via.placeholder.com/150"
                        }
                        alt={assignment.provider.name}
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "16px",
                        }}
                        className="border border-2 border-white shadow-sm"
                      />
                      <div
                        className="position-absolute bottom-0 end-0 bg-success border border-1 border-white rounded-circle"
                        style={{ width: "10px", height: "10px" }}
                      ></div>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">
                        {assignment.provider.name}
                      </h6>
                      <div className="d-flex gap-2 mt-1">
                        <span
                          className={`status-chip py-1 px-2 ${assignment.workStatus === "completed"
                              ? "bg-success-subtle text-success"
                              : assignment.workStatus === "in_progress"
                                ? "bg-warning-subtle text-warning"
                                : "bg-info-subtle text-info"
                            }`}
                          style={{ fontSize: "9px" }}
                        >
                          {assignment.workStatus?.replace("_", " ") ||
                            "Assigned"}
                        </span>
                        {assignment.payment && (
                          <span
                            className={`status-chip py-1 px-2 ${assignment.payment.status === "completed"
                                ? "bg-success-subtle text-success"
                                : assignment.payment.status ===
                                  "awaiting_confirmation"
                                  ? "bg-warning-subtle text-warning"
                                  : "bg-secondary-subtle text-secondary"
                              }`}
                            style={{ fontSize: "9px" }}
                          >
                            <RiMoneyDollarCircleLine
                              size={10}
                              className="me-1"
                            />
                            ₹{assignment.payment.amount} •{" "}
                            {assignment.payment.status === "completed"
                              ? "Paid"
                              : assignment.payment.status ===
                                "awaiting_confirmation"
                                ? "Awaiting"
                                : "Unpaid"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-1">
                    <button
                      className="action-btn-circle"
                      style={{ width: "32px", height: "32px" }}
                      title="Message"
                      onClick={() =>
                        handleTextProvider(
                          assignment.provider.userId,
                          assignment.provider.name,
                        )
                      }
                    >
                      <RiMessage2Line size={16} />
                    </button>
                    {assignment.workStatus === "completed" &&
                      !assignmentReviews[assignment.assignmentId] && (
                        <button
                          className="action-btn-circle hover-text-primary"
                          style={{ width: "32px", height: "32px" }}
                          title="Review"
                          onClick={() => {
                            setSelectedAssignmentId(assignment.assignmentId);
                            setSelectedProviderId(assignment.provider.userId);
                            setSelectedProviderName(assignment.provider.name);
                            setIsReviewModalOpen(true);
                          }}
                        >
                          <RiStarLine size={16} />
                        </button>
                      )}
                    <button
                      className="action-btn-circle hover-text-danger"
                      style={{ width: "32px", height: "32px" }}
                      title="Report"
                      onClick={() => {
                        setSelectedAssignmentId(assignment.assignmentId);
                        setSelectedProviderId(assignment.provider.userId);
                        setSelectedProviderName(assignment.provider.name);
                        setIsReportModalOpen(true);
                      }}
                    >
                      <RiFlagLine size={16} />
                    </button>
                  </div>
                </div>

                {assignment.workStatus === "completed" && (
                  <div className="pt-3 mt-3 border-top border-f1f5f9">
                    <ClientJobPaymentSection
                      assignmentId={assignment.assignmentId}
                      providerName={assignment.provider.name}
                    />
                    {renderReviewCard(
                      assignment.assignmentId,
                      assignment.provider.name,
                      assignment.provider.userId,
                      assignmentReviews,
                      setSelectedAssignmentId,
                      setSelectedProviderId,
                      setSelectedProviderName,
                      setEditReviewState,
                      setIsReviewModalOpen,
                      handleDeleteReviewClick,
                    )}
                  </div>
                )}

                {assignment.workStatus !== "completed" &&
                  assignment.workStatus !== "cancelled" && (
                    <div className="mt-3 pt-3 border-top border-f1f5f9 d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-outline-warning btn-sm rounded-pill px-3 fw-bold"
                        onClick={() => {
                          setSelectedAssignmentId(assignment.assignmentId);
                          setSelectedProviderName(assignment.provider.name);
                          setIsAbsenceModalOpen(true);
                        }}
                      >
                        Report Absence
                      </button>
                      {!hasAwaitingPayment && (
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                          onClick={() => {
                            setSelectedAssignmentId(assignment.assignmentId);
                            setIsCancelModalOpen(true);
                          }}
                          title="Cancel Assignment"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 px-4 bg-white rounded-4 border shadow-sm text-muted">
          <RiGroupLine size={48} className="mb-3 opacity-50" />
          <h5>No providers assigned yet.</h5>
          <p className="mb-0">
            Once providers accept your job, they will appear here.
          </p>
        </div>
      )}
      
        </div>
      )}

      {/* ─── Shared Modals ─── */}
      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAssignmentId(null);
        }}
        onConfirm={handleCancelAssignment}
        type="client"
      />

      <CancelJobModal
        isOpen={isJobCancelModalOpen}
        onClose={() => setIsJobCancelModalOpen(false)}
        onConfirm={confirmCancelJob}
        isCancelling={loading}
      />

      <ReportAbsenceModal
        isOpen={isAbsenceModalOpen}
        onClose={() => {
          setIsAbsenceModalOpen(false);
          setSelectedAssignmentId(null);
        }}
        onSubmit={handleReportAbsence}
        providerName={selectedProviderName}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditReviewState({ isEdit: false });
          setSelectedAssignmentId(null);
          setSelectedProviderId(null);
        }}
        onSubmit={handleReviewSubmit}
        providerName={selectedProviderName}
        initialRating={editReviewState.initialRating}
        initialComment={editReviewState.initialComment}
        initialImages={editReviewState.initialImages}
        isEdit={editReviewState.isEdit}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedAssignmentId(null);
          setSelectedProviderId(null);
        }}
        onSubmit={handleReportSubmit}
        providerName={selectedProviderName}
      />

      <UniversalActionModal
        isOpen={isPaymentConfirmOpen}
        onClose={() => setIsPaymentConfirmOpen(false)}
        onConfirm={() =>
          selectedAssignmentId && handleMarkAsPaid(selectedAssignmentId)
        }
        title="Confirm Cash Payment"
        message="Are you sure you have paid the provider in cash? This will notify the provider to confirm receipt."
        confirmLabel="Yes, I have Paid"
        iconType="info"
      />

      <UniversalActionModal
        isOpen={isDeleteReviewModalOpen}
        onClose={() => {
          setIsDeleteReviewModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={confirmDeleteReview}
        title="Delete Review?"
        message="This action cannot be undone. Are you sure you want to permanently remove your feedback for this provider?"
        confirmLabel="Yes, Delete Review"
        cancelLabel="Keep Review"
        iconType="warning"
      />

      <style>{`
                .outline-hover:hover {
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01) !important;
                    transform: translateY(-2px);
                }
                .hover-lift {
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .hover-lift:hover {
                    transform: translateY(-2px);
                }
                .hover-text-primary:hover {
                    color: #4f46e5 !important;
                }
                .hover-bg-dark:hover {
                    background-color: #0f172a !important;
                    color: white !important;
                }
                .transition-all {
                    transition: all 0.2s ease-in-out;
                }
                .border-f1f5f9 {
                    border-color: #f1f5f9 !important;
                }
                .provider-card {
                    background: #ffffff;
                    border: 1px solid #f1f5f9;
                    border-radius: 32px;
                    padding: 32px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .provider-card:hover {
                    border-color: #e2e8f0;
                    box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.08);
                    transform: translateY(-4px);
                }
                .status-chip {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 8px 16px;
                    border-radius: 100px;
                    display: inline-flex;
                    align-items: center;
                }
                .action-btn-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    color: #64748b;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .action-btn-circle:hover {
                    background: #0f172a;
                    color: white;
                    border-color: #0f172a;
                    transform: translateY(-3px) rotate(8deg);
                    box-shadow: 0 10px 20px -5px rgba(15, 23, 42, 0.2);
                }
                .qw-spin { animation: qwSpin 1.2s linear infinite; }
                @keyframes qwSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* ─── Payment Summary Card ─── */
                .qw-payment-summary-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 28px;
                    padding: 32px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
                    animation: fadeSlideUp 0.5s ease-out;
                }

                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .qw-ps-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .qw-ps-icon-box {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
                }

                .qw-ps-title {
                    font-family: 'Syne', sans-serif;
                    font-weight: 800;
                    font-size: 20px;
                    color: #0f172a;
                    margin: 0;
                }

                .qw-ps-subtitle {
                    font-size: 13px;
                    color: #94a3b8;
                    font-weight: 500;
                    margin: 2px 0 0;
                }

                .qw-ps-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }

                @media (max-width: 768px) {
                    .qw-ps-stats-grid { grid-template-columns: repeat(2, 1fr); }
                }

                .qw-ps-stat {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    transition: all 0.25s ease;
                }

                .qw-ps-stat:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.06);
                }

                .qw-ps-stat-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .qw-ps-stat-icon.total { background: #eff6ff; color: #3b82f6; }
                .qw-ps-stat-icon.paid { background: #f0fdf4; color: #16a34a; }
                .qw-ps-stat-icon.pending { background: #fffbeb; color: #f59e0b; }
                .qw-ps-stat-icon.fee { background: #f5f3ff; color: #8b5cf6; }

                .qw-ps-stat-info {
                    display: flex;
                    flex-direction: column;
                    min-width: 0;
                }

                .qw-ps-stat-label {
                    font-size: 11px;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                }

                .qw-ps-stat-value {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .qw-ps-stat-value.success { color: #16a34a; }
                .qw-ps-stat-value.warning { color: #f59e0b; }
                .qw-ps-stat-value.muted { color: #8b5cf6; }

                /* Progress Bar */
                .qw-ps-progress-wrap {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 24px;
                }

                .qw-ps-progress-bar {
                    flex: 1;
                    height: 10px;
                    background: #f1f5f9;
                    border-radius: 100px;
                    overflow: hidden;
                }

                .qw-ps-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1, #16a34a);
                    border-radius: 100px;
                    transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
                    min-width: 4px;
                }

                .qw-ps-progress-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    white-space: nowrap;
                }

                /* Provider Breakdown */
                .qw-ps-breakdown {
                    border-top: 1px solid #f1f5f9;
                    padding-top: 20px;
                }

                .qw-ps-breakdown-title {
                    font-family: 'Syne', sans-serif;
                    font-weight: 800;
                    font-size: 14px;
                    color: #0f172a;
                    margin-bottom: 14px;
                }

                .qw-ps-breakdown-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 14px;
                    margin-bottom: 8px;
                    transition: all 0.2s ease;
                }

                .qw-ps-breakdown-row:hover {
                    background: #f1f5f9;
                }

                .qw-ps-breakdown-name {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                }

                .qw-ps-mini-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 13px;
                    flex-shrink: 0;
                }

                .qw-ps-breakdown-amount {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .qw-ps-amount-value {
                    font-size: 15px;
                    font-weight: 800;
                    color: #0f172a;
                }

                .qw-ps-method-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 100px;
                    letter-spacing: 0.02em;
                }

                .qw-ps-method-tag.completed { background: #f0fdf4; color: #16a34a; }
                .qw-ps-method-tag.awaiting_confirmation { background: #fffbeb; color: #f59e0b; }
                .qw-ps-method-tag.pending { background: #f1f5f9; color: #64748b; }
            `}</style>
    </>
  );
};

export default UserJobDetailPage;
