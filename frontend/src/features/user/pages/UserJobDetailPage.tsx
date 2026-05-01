import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getJobDetails,
  getJobAssignments,
  cancelAssignmentByClient,
  reportAbsence,
  submitReview,
  submitReport,
  cancelJob,
  markAsPaidByCash,
} from "../services/userJob.service";
import ReviewModal from "../components/ReviewModal";
import ReportIssueModal from "../components/ReportIssueModal";
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
  RiFlagLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import CancellationModal from "../../provider/components/CancellationModal";
import ReportAbsenceModal from "../../provider/components/ReportAbsenceModal";
import UniversalActionModal from "../../provider/components/UniversalActionModal";
import ClientJobPaymentSection from "../../finance/components/ClientJobPaymentSection";
import { AxiosError } from "axios";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: "public" | "private";
  location: { address: string } | null;
  budget: string;
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

const UserJobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const hasAwaitingPayment = React.useMemo(() => {
    if (job?.hiredProvider?.payment?.status === 'awaiting_provider_confirmation') return true;
    return assignments.some(a => a.payment?.status === 'awaiting_provider_confirmation');
  }, [job, assignments]);


  const handleCancelAssignment = async (notes: string) => {
    if (!selectedAssignmentId) return;
    try {
      setLoading(true);
      const response = await cancelAssignmentByClient(selectedAssignmentId, notes);
      if (response.success) {
        toast.success("Assignment cancelled successfully");
        fetchData();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to cancel assignment");
    } finally {
      setLoading(false);
      setSelectedAssignmentId(null);
    }
  };

  const handleCancelJob = async () => {
    if (!jobId) return;
    if (!window.confirm("Are you sure you want to cancel this job offer?")) return;
    
    try {
      setLoading(true);
      const response = await cancelJob(jobId);
      if (response.success) {
        toast.success("Job offer cancelled successfully");
        fetchData();
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
      const response = await reportAbsence(selectedAssignmentId, notes, evidence);
      if (response.success) {
        toast.success("Absence reported successfully");
        fetchData();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to report absence");
    } finally {
      setLoading(false);
      setSelectedAssignmentId(null);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string, images: string[]) => {
    if (!selectedAssignmentId || !selectedProviderId) return;
    try {
      setLoading(true);
      const response = await submitReview({
        assignmentId: selectedAssignmentId,
        revieweeId: selectedProviderId,
        rating,
        comment,
        images,
        role: "client_to_provider",
      });
      console.log(response,"Review submitted successfully");

      toast.success(response.message || "Review submitted successfully");
      fetchData();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "An unexpected error occurred during review");
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (reason: string, description: string, images: string[]) => {
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
      toast.error(axiosError.response?.data?.message || "An unexpected error occurred during report");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (assignmentId: string) => {
    try {
      setLoading(true);
      const response = await markAsPaidByCash(assignmentId);
      if (response.success) {
        toast.success("Payment marked as paid by cash. Awaiting provider confirmation.");
        fetchData();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to mark as paid");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const jobRes = await getJobDetails(jobId!);
      if (jobRes.success) {
        setJob(jobRes.data);
        if (jobRes.data.visibility === "public") {
          const assignRes = await getJobAssignments(jobId!);
          if (assignRes.success) {
            setAssignments(assignRes.data);
          }
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId, fetchData]);

  const handleTextProvider = (providerName: string) => {
    toast.success(`Chat with ${providerName} coming soon!`);
  };

  if (loading) {
    return (
      <div
        className="qw-page-container d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "60vh" }}
      >
        <RiLoader4Line size={48} className="text-primary qw-spin mb-3" />
        <p className="text-muted fw-semibold fs-5">Loading job details...</p>
        <style>{`
                    .qw-spin { animation: qwSpin 1.2s linear infinite; }
                    @keyframes qwSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="qw-page-container text-center py-5">
        <RiErrorWarningLine size={64} className="text-danger mb-3" />
        <h2>Job Not Found</h2>
        <Link
          to="/user/jobs"
          className="btn btn-primary mt-3 rounded-pill px-4"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  const isDirectHire = job.visibility === "private";
  const isRejected = job.status === "rejected";

  return (
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
            <strong>Job Locked:</strong> You have marked a payment as paid. Job details and cancellations are restricted until the provider confirms the receipt.
          </div>
        </div>
      )}
      <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border border-f1f5f9 mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-4 mb-4">
          <div>
            <div className="d-flex align-items-center gap-3 mb-2">
              <span
                className={`badge rounded-pill bg-${
                  job.status === "open"
                    ? "warning text-dark"
                    : job.status === "rejected" || job.status === "cancelled"
                      ? "danger"
                      : job.status === "completed"
                        ? "success"
                        : "primary"
                }-subtle text-${
                  job.status === "open"
                    ? "warning text-dark"
                    : job.status === "rejected" || job.status === "cancelled"
                      ? "danger"
                      : job.status === "completed"
                        ? "success"
                        : "primary"
                } px-3 py-2 fw-bold text-uppercase`}
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                {job.status.replace("_", " ")}
              </span>
              <span
                className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-bold text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                {isDirectHire ? "Direct Hire" : "Public Hire"}
              </span>
            </div>
            <h1
              className="fw-bold text-dark mb-3"
              style={{ fontFamily: "Syne, sans-serif", letterSpacing: "-1px" }}
            >
              {job.title}
            </h1>
            <p
              className="text-muted fs-5 mb-0"
              style={{ maxWidth: "800px", lineHeight: "1.6" }}
            >
              {job.description}
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
              {job.location?.address || "Remote"}
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiMoneyDollarCircleLine className="me-1" /> Budget
            </div>
            <div className="fw-semibold text-dark fs-6">{job.budget}</div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiCalendarCheckLine className="me-1" /> Start Date
            </div>
            <div className="fw-semibold text-dark fs-6">{job.startDate}</div>
          </div>
          <div className="col-6 col-md-3">
            <div
              className="text-muted text-uppercase fw-bold mb-1"
              style={{ fontSize: "11px", letterSpacing: "0.5px" }}
            >
              <RiGroupLine className="me-1" /> Duration Type
            </div>
            <div className="fw-semibold text-dark fs-6 text-capitalize">
              {job.durationType.replace("_", " ")}
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
              {job.acceptedFreelancers} / {job.freelancersNeeded} Assigned
            </div>
          </div>
        </div>
      </div>

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
                "{job.rejectionReason || "No reason provided."}"
              </em>
            </p>
          </div>
        </div>
      )}

      <h3 className="fw-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
        {isDirectHire ? "Hired Provider" : "Assigned Providers"}
      </h3>

      {isDirectHire ? (
        job.hiredProvider ? (() => {
          const hp = job.hiredProvider;
          return (
            <div className="provider-card mb-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 mb-4">
                <div className="d-flex align-items-center gap-4">
                  <div className="position-relative">
                    <img
                      src={hp.profileImage || "https://via.placeholder.com/150"}
                      alt={hp.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "24px",
                      }}
                      className="shadow-sm border border-2 border-white"
                    />
                    <div className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle" style={{ width: '14px', height: '14px' }}></div>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h4 className="fw-bold mb-0 text-dark" style={{ fontFamily: 'Syne, sans-serif' }}>{hp.name}</h4>
                      {hp.isVerified && <RiCheckboxCircleLine className="text-primary" size={18} />}
                    </div>
                    <p className="text-muted mb-2 small fw-medium">{hp.headline || "Professional Service Provider"}</p>
                    <div className="d-flex gap-2">
                      <span className={`status-chip ${
                        hp.workStatus === "completed" ? "bg-success-subtle text-success" : 
                        hp.workStatus === "in_progress" ? "bg-warning-subtle text-warning" : "bg-info-subtle text-info"
                      }`}>
                        {hp.workStatus?.replace("_", " ") || "Assigned"}
                      </span>
                      {job.status === "open" && (
                         <span className="status-chip bg-amber-50 text-amber-600">Pending Response</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button 
                    className="action-btn-circle" 
                    title="Message"
                    onClick={() => handleTextProvider(hp.name)}
                  >
                    <RiMessage2Line size={20} />
                  </button>
                  {hp.workStatus === "completed" && (
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
                  {job.status === "open" && isDirectHire && !hasAwaitingPayment && (
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
                </div>
              )}
            </div>
          );
        })() : (
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
                        src={assignment.provider.profileImage || "https://via.placeholder.com/150"}
                        alt={assignment.provider.name}
                        style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "16px" }}
                        className="border border-2 border-white shadow-sm"
                      />
                      <div className="position-absolute bottom-0 end-0 bg-success border border-1 border-white rounded-circle" style={{ width: '10px', height: '10px' }}></div>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{assignment.provider.name}</h6>
                      <div className="d-flex gap-2 mt-1">
                        <span className={`status-chip py-1 px-2 ${
                          assignment.workStatus === "completed" ? "bg-success-subtle text-success" : 
                          assignment.workStatus === "in_progress" ? "bg-warning-subtle text-warning" : "bg-info-subtle text-info"
                        }`} style={{ fontSize: '9px' }}>
                          {assignment.workStatus?.replace("_", " ") || "Assigned"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-1">
                    <button 
                      className="action-btn-circle" 
                      style={{ width: '32px', height: '32px' }}
                      title="Message"
                      onClick={() => handleTextProvider(assignment.provider.name)}
                    >
                      <RiMessage2Line size={16} />
                    </button>
                    {assignment.workStatus === "completed" && (
                      <button 
                        className="action-btn-circle hover-text-primary" 
                        style={{ width: '32px', height: '32px' }}
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
                      style={{ width: '32px', height: '32px' }}
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

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedAssignmentId(null);
        }}
        onConfirm={handleCancelAssignment}
        type="client"
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
          setSelectedAssignmentId(null);
          setSelectedProviderId(null);
        }}
        onSubmit={handleReviewSubmit}
        providerName={selectedProviderName}
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
        onConfirm={() => selectedAssignmentId && handleMarkAsPaid(selectedAssignmentId)}
        title="Confirm Cash Payment"
        message="Are you sure you have paid the provider in cash? This will notify the provider to confirm receipt."
        confirmLabel="Yes, I have Paid"
        iconType="info"
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
            `}</style>
    </div>
  );
};

export default UserJobDetailPage;
