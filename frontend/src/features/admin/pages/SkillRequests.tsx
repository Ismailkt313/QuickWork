import React, { useEffect, useState, useCallback } from "react";
import {
  getPendingServiceRequests,
  approveServiceRequest,
  rejectServiceRequest,
} from "../services/adminServiceRequest.service";
import type { ServiceRequest } from "../services/adminServiceRequest.service";
import useDebounce from "../../../hooks/useDebounce";
import { AdminPageHeader, AdminFilterBar, DataTable, type Column } from "../components/table";
import "../admin.css";

interface ToastItem {
  id: number;
  type: "success" | "error";
  message: string;
}

type ModalMode = "approve" | "reject" | null;

interface ModalState {
  mode: ModalMode;
  requestId: string;
  requestName: string;
  loading: boolean;
}

const SkillRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [lastSearch, setLastSearch] = useState("");
  const limit = 5;

  if (debouncedSearch !== lastSearch) {
    setLastSearch(debouncedSearch);
    setPage(1);
  }

  const [modal, setModal] = useState<ModalState>({
    mode: null,
    requestId: "",
    requestName: "",
    loading: false,
  });

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPendingServiceRequests({ page, limit, search: debouncedSearch });
      setRequests(result.data || []);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch skills", error);
      showToast("error", "Failed to load pending skill requests.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openModal = (
    mode: ModalMode,
    requestId: string,
    requestName: string,
  ) => {
    setModal({ mode, requestId, requestName, loading: false });
    setRejectionReason("");
  };

  const closeModal = () => {
    if (modal.loading) return;
    setModal({ mode: null, requestId: "", requestName: "", loading: false });
    setRejectionReason("");
  };

  const handleApprove = async () => {
    setModal((prev) => ({ ...prev, loading: true }));
    try {
      const result = await approveServiceRequest(modal.requestId);
      if (result.success) {
        setRequests((prev) => prev.filter((r) => r._id !== modal.requestId));
        showToast(
          "success",
          result.message ||
            `Skill "${modal.requestName}" approved successfully!`,
        );
      } else {
        showToast("error", result.message || "Failed to approve skill.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to approve skill.";
      showToast("error", msg);
    } finally {
      setModal({ mode: null, requestId: "", requestName: "", loading: false });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setModal((prev) => ({ ...prev, loading: true }));
    try {
      await rejectServiceRequest(modal.requestId, rejectionReason.trim());
      setRequests((prev) => prev.filter((r) => r._id !== modal.requestId));
      showToast("success", `Skill "${modal.requestName}" has been rejected.`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to reject skill.";
      showToast("error", msg);
    } finally {
      setModal({ mode: null, requestId: "", requestName: "", loading: false });
      setRejectionReason("");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const columns: Column<ServiceRequest>[] = [
    {
      key: "requestedSkill",
      header: "Requested Skill",
      render: (request) => (
        <div className="d-flex align-items-center gap-3">
          <div
            className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
          >
            <i className="bi bi-briefcase fw-bold"></i>
          </div>
          <div>
            <span className="user-name fw-bold text-dark">{request.name}</span>
            <span
              className="badge bg-warning text-dark bg-opacity-25 rounded-pill border border-warning border-opacity-50 small mt-1 d-block w-auto"
              style={{ fontSize: "10px" }}
            >
              PENDING REVIEW
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "requestedBy",
      header: "Requested By",
      render: (request) => (
        <div className="d-flex align-items-center gap-2">
          <div
            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold"
            style={{
              width: "32px",
              height: "32px",
              fontSize: "12px",
            }}
          >
            {request.requestedBy?.name?.[0]?.toUpperCase() || "P"}
          </div>
          <div className="d-flex flex-column">
            <span className="small fw-bold text-dark">
              {request.requestedBy?.name || "Unknown"}
            </span>
            <span
              className="user-email text-muted"
              style={{ fontSize: "11px" }}
            >
              {request.requestedBy?.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "dateSubmitted",
      header: "Date Submitted",
      render: (request) => (
        <span className="text-secondary small">
          {formatDate(request.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (request) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn-action-block unblock"
            onClick={() => openModal("approve", request._id, request.name)}
          >
            APPROVE
          </button>
          <button
            className="btn-action-block block"
            onClick={() => openModal("reject", request._id, request.name)}
          >
            REJECT
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast-item ${toast.type}`}>
              <i
                className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"} toast-icon`}
              ></i>
              <span className="toast-message">{toast.message}</span>
              <button
                className="toast-close"
                onClick={() => removeToast(toast.id)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {modal.mode === "approve" && (
        <div className="confirm-modal-overlay" onClick={closeModal}>
          <div
            className="confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon approve">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="confirm-modal-title">Approve Skill Request</div>
            <div className="confirm-modal-message">
              Are you sure you want to approve{" "}
              <strong className="text-dark">"{modal.requestName}"</strong>? This
              skill will be added to the global directory and automatically
              assigned to the requesting provider's profile.
            </div>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn cancel"
                onClick={closeModal}
                disabled={modal.loading}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn confirm-approve"
                onClick={handleApprove}
                disabled={modal.loading}
              >
                {modal.loading ? "Processing..." : "Yes, Approve Skill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.mode === "reject" && (
        <div className="confirm-modal-overlay" onClick={closeModal}>
          <div
            className="confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon reject">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="confirm-modal-title">Reject Skill Request</div>
            <div className="confirm-modal-message">
              Provide a reason for rejecting the skill request for{" "}
              <strong className="text-dark">"{modal.requestName}"</strong>.
            </div>
            <label className="reject-reason-label">
              Reason for Rejection (Visible to Provider)
            </label>
            <textarea
              className="reject-reason-textarea"
              placeholder="E.g. Skill already exists under a similar name, or is not applicable..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={modal.loading}
            />
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn cancel"
                onClick={closeModal}
                disabled={modal.loading}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn confirm-reject"
                onClick={handleReject}
                disabled={modal.loading || !rejectionReason.trim()}
              >
                {modal.loading ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminPageHeader
        title="Global Skill Requests"
        subtitle="Review and approve new skill suggestions submitted by Service Providers during onboarding or profile updates."
        breadcrumb={
          <>Admin <span className="separator">›</span> <span>Skill Requests</span></>
        }
        actionButton={{
          label: "Refresh List",
          icon: `bi bi-arrow-clockwise ${isLoading ? "spin" : ""}`,
          onClick: fetchRequests
        }}
      />

      <AdminFilterBar
        searchPlaceholder="Search by skill name or provider..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onReset={() => {
          setSearchInput("");
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={requests}
        loading={isLoading}
        emptyMessage="No pending skill requests found."
        emptyIcon="bi bi-inbox"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(request) => request._id || Math.random().toString()}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .text-dark { color: #1e293b !important; }
            `,
        }}
      />
    </div>
  );
};

export default SkillRequests;
