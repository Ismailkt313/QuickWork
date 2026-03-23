import { useState, useEffect, useCallback } from "react";
import { getPendingProviders, approveProvider, rejectProvider } from "../services/adminApi";
import type { IUserListItem } from "../services/adminApi";

interface ToastItem {
    id: number;
    type: "success" | "error";
    message: string;
}

type ModalMode = "approve" | "reject" | null;

interface ModalState {
    mode: ModalMode;
    providerId: string;
    providerName: string;
    loading: boolean;
}

const ProviderManagement = () => {
    const [providers, setProviders] = useState<IUserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const [rejectionReason, setRejectionReason] = useState("");

    const [modal, setModal] = useState<ModalState>({
        mode: null,
        providerId: "",
        providerName: "",
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

    const fetchProviders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPendingProviders();
            setProviders(res.data.data.users);
        } catch {
            setProviders([]);
            showToast("error", "Failed to load pending providers.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const openModal = (mode: ModalMode, providerId: string, providerName: string) => {
        setModal({ mode, providerId, providerName, loading: false });
        setRejectionReason("");
    };

    const closeModal = () => {
        if (modal.loading) return;
        setModal({ mode: null, providerId: "", providerName: "", loading: false });
        setRejectionReason("");
    };

    const executeApprove = async () => {
        setModal((prev) => ({ ...prev, loading: true }));
        try {
            await approveProvider(modal.providerId);
            setProviders((prev) => prev.filter((p) => p.id !== modal.providerId));
            showToast("success", `Provider ${modal.providerName} has been approved successfully.`);
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to approve provider.";
            showToast("error", msg);
        } finally {
            setModal({ mode: null, providerId: "", providerName: "", loading: false });
        }
    };

    const executeReject = async () => {
        if (!rejectionReason.trim()) return;
        setModal((prev) => ({ ...prev, loading: true }));
        try {
            await rejectProvider(modal.providerId, rejectionReason.trim());
            setProviders((prev) => prev.filter((p) => p.id !== modal.providerId));
            showToast("success", `Provider ${modal.providerName} has been rejected.`);
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to reject provider.";
            showToast("error", msg);
        } finally {
            setModal({ mode: null, providerId: "", providerName: "", loading: false });
            setRejectionReason("");
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div>
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

            {modal.mode === "approve" && (
                <div className="confirm-modal-overlay" onClick={closeModal}>
                    <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon approve">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <div className="confirm-modal-title">Approve Provider</div>
                        <div className="confirm-modal-message">
                            Are you sure you want to approve <strong>{modal.providerName}</strong>?
                            Their account role will be upgraded to provider and they will be able to offer services on the platform.
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
                                onClick={executeApprove}
                                disabled={modal.loading}
                            >
                                {modal.loading ? "Processing..." : "Yes, Approve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modal.mode === "reject" && (
                <div className="confirm-modal-overlay" onClick={closeModal}>
                    <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-modal-icon reject">
                            <i className="bi bi-x-circle-fill"></i>
                        </div>
                        <div className="confirm-modal-title">Reject Provider</div>
                        <div className="confirm-modal-message">
                            Are you sure you want to reject <strong>{modal.providerName}</strong>'s provider application?
                        </div>
                        <label className="reject-reason-label">Reason for Rejection</label>
                        <textarea
                            className="reject-reason-textarea"
                            placeholder="E.g. Incomplete portfolio, insufficient experience details..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
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
                                onClick={executeReject}
                                disabled={modal.loading || !rejectionReason.trim()}
                            >
                                {modal.loading ? "Processing..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-breadcrumb">
                Admin <span className="separator">›</span> <span>Providers</span>
            </div>

            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Provider Management</h1>
                    <p className="admin-page-subtitle">
                        Review pending provider applications and approve or reject them.
                    </p>
                </div>
                <button className="btn btn-invite" onClick={fetchProviders} disabled={loading}>
                    <i className={`bi bi-arrow-clockwise ${loading ? "spin" : ""}`}></i>
                    Refresh
                </button>
            </div>

            <div className="admin-stats-row" style={{ marginBottom: "1.5rem" }}>
                <div className="admin-stat-card">
                    <div className="admin-stat-label">Pending Applications</div>
                    <div className="admin-stat-value orange">
                        <i className="bi bi-hourglass-split" style={{ fontSize: "1.25rem", marginRight: 8 }}></i>
                        {loading ? "—" : providers.length}
                    </div>
                </div>
            </div>

            <div className="admin-table-card">
                {loading ? (
                    <div className="admin-loading">
                        <div className="spinner-border spinner-border-sm"></div>
                        <span>Loading pending providers...</span>
                    </div>
                ) : providers.length === 0 ? (
                    <div className="admin-empty">
                        <i className="bi bi-person-check d-block"></i>
                        <div>No pending provider applications</div>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Provider Name</th>
                                <th>Email</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {providers.map((provider) => (
                                <tr key={provider.id}>
                                    <td>
                                        <span className="user-name">{provider.name}</span>
                                    </td>
                                    <td>
                                        <span className="user-email" style={{ fontSize: "0.8125rem" }}>{provider.email}</span>
                                    </td>
                                    <td>{formatDate(provider.createdAt)}</td>
                                    <td>
                                        <span className="status-indicator">
                                            <span className="status-dot" style={{ background: "#f59e0b" }}></span>
                                            Pending
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                className="btn-action-block unblock"
                                                onClick={() => openModal("approve", provider.id, provider.name)}
                                                style={{ textTransform: "uppercase" }}
                                            >
                                                APPROVE
                                            </button>
                                            <button
                                                className="btn-action-block block"
                                                onClick={() => openModal("reject", provider.id, provider.name)}
                                                style={{ textTransform: "uppercase" }}
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
            `}} />
        </div>
    );
};

export default ProviderManagement;
