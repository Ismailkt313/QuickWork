import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getJobDetails,
  getJobAssignments,
  cancelAssignmentByClient,
  reportAbsence,
  submitReview,
  submitReport,
  cancelJob,
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
  RiUserUnfollowLine,
  RiStarLine,
  RiFlagLine,
} from "react-icons/ri";
import CancellationModal from "../../provider/components/CancellationModal";
import ReportAbsenceModal from "../../provider/components/ReportAbsenceModal";

const UserJobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
//   const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedProviderName, setSelectedProviderName] = useState<string>("");
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const handleCancelAssignment = async (notes: string) => {
    if (!selectedAssignmentId) return;
    try {
      setLoading(true);
      const response = await cancelAssignmentByClient(selectedAssignmentId, notes);
      if (response.success) {
        toast.success("Assignment cancelled successfully");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel assignment");
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
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel job");
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
    } catch (error: any) {
      toast.error(error.message || "Failed to report absence");
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
    } catch (error: any) {
      console.error("Review Error:", error);
      toast.error(error.message || "An unexpected error occurred during review");
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
    } catch (error: any) {
      console.error("Report Error:", error);
      toast.error(error.message || "An unexpected error occurred during report");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
        job.hiredProvider ? (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 outline-hover transition-all">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-sm-start flex-column flex-sm-row gap-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="text-muted fw-bold text-uppercase"
                    style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                  >
                    Offer Status
                  </span>
              {job.status === "open" && (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fw-bold">
                    Pending Response
                  </span>
                  {isDirectHire && (
                    <button 
                      className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1-5 fw-bold"
                      onClick={handleCancelJob}
                      style={{ fontSize: '11px' }}
                    >
                      Cancel Offer
                    </button>
                  )}
                </div>
              )}
                  {["fully_assigned", "in_progress", "completed"].includes(
                    job.status,
                  ) && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-success rounded-pill px-3 py-1 fw-bold">
                        Accepted
                      </span>
                      <span
                        className={`badge rounded-pill px-3 py-1 fw-bold text-uppercase`}
                        style={{
                          fontSize: "10px",
                          backgroundColor:
                            job.hiredProvider?.workStatus === "completed"
                              ? "#ecfdf5"
                              : job.hiredProvider?.workStatus === "in_progress"
                                ? "#fffbeb"
                                : "#eef2ff",
                          color:
                            job.hiredProvider?.workStatus === "completed"
                              ? "#10b981"
                              : job.hiredProvider?.workStatus === "in_progress"
                                ? "#f59e0b"
                                : "#6366f1",
                          border: `1px solid ${
                            job.hiredProvider?.workStatus === "completed"
                              ? "#d1fae5"
                              : job.hiredProvider?.workStatus === "in_progress"
                                ? "#fef3c7"
                                : "#dbeafe"
                          }`,
                        }}
                      >
                        {job.hiredProvider?.workStatus?.replace("_", " ") ||
                          "Assigned"}
                      </span>
                    </div>
                  )}
                  {job.status === "rejected" && (
                    <span className="badge bg-danger rounded-pill px-3 py-1 fw-bold">
                      Declined
                    </span>
                  )}
                  {job.status === "cancelled" && (
                    <span className="badge bg-secondary rounded-pill px-3 py-1 fw-bold">
                      Job Cancelled
                    </span>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center gap-4 flex-wrap">
                <img
                  src={
                    job.hiredProvider.profileImage ||
                    "https://via.placeholder.com/150"
                  }
                  alt={job.hiredProvider.name}
                  style={{
                    width: "96px",
                    height: "96px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  className="shadow-sm border border-4 border-white"
                />
                  <div className="flex-grow-1">
                    <h4 className="fw-bold mb-1 text-dark">
                      {job.hiredProvider.name}
                    </h4>
                    <p className="text-muted mb-0">
                      {job.hiredProvider.headline}
                    </p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {job.hiredProvider.workStatus === "completed" && (
                      <>
                        <button
                          className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm transition-all"
                          onClick={() => {
                            setSelectedAssignmentId(job.hiredProvider.assignmentId);
                            setSelectedProviderId(job.hiredProvider.userId);
                            setSelectedProviderName(job.hiredProvider.name);
                            setIsReviewModalOpen(true);
                          }}
                        >
                          <RiStarLine /> Review
                        </button>
                        <button
                          className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 transition-all"
                          onClick={() => {
                            setSelectedAssignmentId(job.hiredProvider.assignmentId);
                            setSelectedProviderId(job.hiredProvider.userId);
                            setSelectedProviderName(job.hiredProvider.name);
                            setIsReportModalOpen(true);
                          }}
                        >
                          <RiFlagLine /> Report Issue
                        </button>
                      </>
                    )}
                  </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-center bg-white rounded-4 shadow-sm border text-muted">
            Provider details unavailable.
          </div>
        )
      ) : assignments.length > 0 ? (
        <div className="row g-4">
          {assignments.map((assignment: any) => (
            <div key={assignment.assignmentId} className="col-12 col-xl-6">
              <div className="card border-0 shadow-sm rounded-4 h-100 outline-hover p-4 d-flex flex-row align-items-center gap-4 transition-all">
                <img
                  src={
                    assignment.provider.profileImage ||
                    "https://via.placeholder.com/150"
                  }
                  alt={assignment.provider.name}
                  style={{
                    width: "72px",
                    height: "72px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                  className="shadow-sm"
                />
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-1">{assignment.provider.name}</h5>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span
                      className="badge rounded-pill px-2 py-1 fw-bold text-uppercase"
                      style={{
                        fontSize: "9px",
                        backgroundColor:
                          assignment.workStatus === "completed"
                            ? "#ecfdf5"
                            : assignment.workStatus === "in_progress"
                              ? "#fffbeb"
                              : "#eef2ff",
                        color:
                          assignment.workStatus === "completed"
                            ? "#10b981"
                            : assignment.workStatus === "in_progress"
                              ? "#f59e0b"
                              : "#6366f1",
                      }}
                    >
                      {assignment.workStatus.replace("_", " ")}
                    </span>
                    <p
                      className="text-muted small mb-0 text-truncate"
                      style={{ maxWidth: "120px" }}
                    >
                      {assignment.provider.headline}
                    </p>
                  </div>
                </div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-dark rounded-circle p-3 d-flex align-items-center justify-content-center hover-bg-dark transition-all"
                      title="Text Provider"
                      onClick={() => handleTextProvider(assignment.provider.name)}
                    >
                      <RiMessage2Line size={20} />
                    </button>
                    {assignment.workStatus === "completed" && (
                      <>
                        <button
                          className="btn btn-outline-primary rounded-circle p-3 d-flex align-items-center justify-content-center transition-all"
                          title="Review Provider"
                          onClick={() => {
                            setSelectedAssignmentId(assignment.assignmentId);
                            setSelectedProviderId(assignment.provider.userId);
                            setSelectedProviderName(assignment.provider.name);
                            setIsReviewModalOpen(true);
                          }}
                        >
                          <RiStarLine size={20} />
                        </button>
                        <button
                          className="btn btn-outline-danger rounded-circle p-3 d-flex align-items-center justify-content-center transition-all"
                          title="Report Issue"
                          onClick={() => {
                            setSelectedAssignmentId(assignment.assignmentId);
                            setSelectedProviderId(assignment.provider.userId);
                            setSelectedProviderName(assignment.provider.name);
                            setIsReportModalOpen(true);
                          }}
                        >
                          <RiFlagLine size={20} />
                        </button>
                      </>
                    )}
                    {assignment.workStatus !== "completed" &&
                      assignment.workStatus !== "cancelled" && (
                        <>
                          <button
                            className="btn btn-outline-warning rounded-circle p-3 d-flex align-items-center justify-content-center transition-all"
                            title="Report Absence"
                            onClick={() => {
                              setSelectedAssignmentId(assignment.assignmentId);
                              setSelectedProviderName(assignment.provider.name);
                              setIsAbsenceModalOpen(true);
                            }}
                          >
                            <RiErrorWarningLine size={20} />
                          </button>
                          <button
                            className="btn btn-outline-danger rounded-circle p-3 d-flex align-items-center justify-content-center transition-all"
                            title="Cancel Assignment"
                            onClick={() => {
                              setSelectedAssignmentId(assignment.assignmentId);
                              setIsCancelModalOpen(true);
                            }}
                          >
                            <RiUserUnfollowLine size={20} />
                          </button>
                        </>
                      )}
                  </div>
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
            `}</style>
    </div>
  );
};

export default UserJobDetailPage;
