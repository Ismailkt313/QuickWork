import React, { useEffect, useState, useCallback } from "react";
import {
    getPendingServiceRequests,
    approveServiceRequest,
    rejectServiceRequest
} from "../services/adminServiceRequest.service";
import type { ServiceRequest } from "../services/adminServiceRequest.service";
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
            const data = await getPendingServiceRequests();
            setRequests(data || []);
        } catch (error) {
            console.error("Failed to fetch skills", error);
            showToast("error", "Failed to load pending skill requests.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const openModal = (mode: ModalMode, requestId: string, requestName: string) => {
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
                showToast("success", result.message || `Skill "${modal.requestName}" approved successfully!`);
            } else {
                showToast("error", result.message || "Failed to approve skill.");
            }
        } catch (error: any) {
            showToast("error", error.message || "Failed to approve skill.");
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
        } catch (error: any) {
            showToast("error", error.message || "Failed to reject skill.");
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

    return (
        <div className="admin-page-container">
            {/* Toast Notifications */}
            {toasts.length > 0 && (
                <div className="toast-container">
                    {toasts.map((toast) => (
                        <div key={toast.id} className={`toast-item ${toast.type}`}>
                            <i className={`bi ${toast.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"} toast-icon`}></i>
                            <span className="toast-message">{toast.message}</span>
                            <button className="toast-close" onClick={() => removeToast(toast.id)}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Approve Modal */}
            {modal.mode === "approve" && (
                <div className="confirm-modal-overlay" onClick={closeModal}>
                    <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon approve">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <div className="confirm-modal-title">Approve Skill Request</div>
                        <div className="confirm-modal-message">
                            Are you sure you want to approve <strong className="text-dark">"{modal.requestName}"</strong>?
                            This skill will be added to the global directory and automatically assigned to the requesting provider's profile.
                        </div>
                        <div className="confirm-modal-actions">
                            <button className="confirm-modal-btn cancel" onClick={closeModal} disabled={modal.loading}>
                                Cancel
                            </button>
                            <button className="confirm-modal-btn confirm-approve" onClick={handleApprove} disabled={modal.loading}>
                                {modal.loading ? "Processing..." : "Yes, Approve Skill"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {modal.mode === "reject" && (
                <div className="confirm-modal-overlay" onClick={closeModal}>
                    <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon reject">
                            <i className="bi bi-x-circle-fill"></i>
                        </div>
                        <div className="confirm-modal-title">Reject Skill Request</div>
                        <div className="confirm-modal-message">
                            Provide a reason for rejecting the skill request for <strong className="text-dark">"{modal.requestName}"</strong>.
                        </div>
                        <label className="reject-reason-label">Reason for Rejection (Visible to Provider)</label>
                        <textarea
                            className="reject-reason-textarea"
                            placeholder="E.g. Skill already exists under a similar name, or is not applicable..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            disabled={modal.loading}
                        />
                        <div className="confirm-modal-actions">
                            <button className="confirm-modal-btn cancel" onClick={closeModal} disabled={modal.loading}>
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

            <div className="admin-breadcrumb">
                Admin <span className="separator">›</span> <span>Skill Requests</span>
            </div>

            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Global Skill Requests</h1>
                    <p className="admin-page-subtitle">
                        Review and approve new skill suggestions submitted by Service Providers during onboarding or profile updates.
                    </p>
                </div>
                <button className="btn-invite" onClick={fetchRequests} disabled={isLoading}>
                    <i className={`bi bi-arrow-clockwise ${isLoading ? "spin" : ""}`}></i>
                    Refresh List
                </button>
            </div>

            <div className="admin-table-card">
                {isLoading ? (
                    <div className="admin-loading">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3">Loading pending requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="admin-empty">
                        <i className="bi bi-inbox d-block"></i>
                        <div>No pending skill requests</div>
                        <p className="small text-muted mt-2">All submitted skill requests have been processed.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Requested Skill</th>
                                <th>Requested By</th>
                                <th>Date Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => (
                                <tr key={request._id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                                                <i className="bi bi-briefcase fw-bold"></i>
                                            </div>
                                            <div>
                                                <span className="user-name">{request.name}</span>
                                                <span className="badge bg-warning text-dark bg-opacity-25 rounded-pill border border-warning border-opacity-50 small mt-1" style={{ fontSize: '10px' }}>PENDING REVIEW</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div 
                                                className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold" 
                                                style={{ width: "32px", height: "32px", fontSize: "12px" }}
                                            >
                                                {request.requestedBy?.name?.[0]?.toUpperCase() || "P"}
                                            </div>
                                            <div className="d-flex flex-column">
                                                <span className="small fw-bold text-dark">{request.requestedBy?.name || "Unknown"}</span>
                                                <span className="user-email" style={{ fontSize: "11px" }}>{request.requestedBy?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-secondary small">{formatDate(request.createdAt)}</span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .text-dark { color: #1e293b !important; }
            `}} />
        </div>
    );
};

export default SkillRequests;
