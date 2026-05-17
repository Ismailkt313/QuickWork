import { useState, useEffect, useCallback } from "react";
import {
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getProviderById,
} from "../services/adminApi";
import type { IUserListItem, IServiceProviderDetails } from "../types/admin.types";
import ProviderProfileModal from "../components/ProviderProfileModal";
import axios from "axios";
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
  providerId: string;
  providerName: string;
  loading: boolean;
}

const ProviderManagement = () => {
  const [providers, setProviders] = useState<IUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [lastSearch, setLastSearch] = useState("");
  const limit = 4;

  if (debouncedSearch !== lastSearch) {
    setLastSearch(debouncedSearch);
    setPage(1);
  }

  const [modal, setModal] = useState<ModalState>({
    mode: null,
    providerId: "",
    providerName: "",
    loading: false,
  });

  const [selectedProvider, setSelectedProvider] = useState<IServiceProviderDetails | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);

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
      const res = await getPendingProviders({ page, limit, search: debouncedSearch });
      setProviders(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch {
      setProviders([]);
      showToast("error", "Failed to load pending providers.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const openModal = (
    mode: ModalMode,
    providerId: string,
    providerName: string,
  ) => {
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
      showToast(
        "success",
        `Provider ${modal.providerName} has been approved successfully.`,
      );
    } catch (error) {
      let msg = "Failed to approve provider.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      showToast("error", msg);
    } finally {
      setModal({
        mode: null,
        providerId: "",
        providerName: "",
        loading: false,
      });
    }
  };

  const executeReject = async () => {
    if (!rejectionReason.trim()) return;
    setModal((prev) => ({ ...prev, loading: true }));
    try {
      await rejectProvider(modal.providerId, rejectionReason.trim());
      setProviders((prev) => prev.filter((p) => p.id !== modal.providerId));
      showToast("success", `Provider ${modal.providerName} has been rejected.`);
    } catch (error) {
      let msg = "Failed to reject provider.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      showToast("error", msg);
    } finally {
      setModal({
        mode: null,
        providerId: "",
        providerName: "",
        loading: false,
      });
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

  const handleViewProfile = async (id: string) => {
    if (fetchingDetail) return;
    setFetchingDetail(true);
    try {
      const res = await getProviderById(id);
      if (res.data && res.data.success) {
        setSelectedProvider(res.data.data);
        setDetailModalOpen(true);
      } else {
        showToast("error", "Failed to fetch provider details.");
      }
    } catch (error) {
      let msg = "Error fetching details.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      showToast("error", msg);
    } finally {
      setFetchingDetail(false);
    }
  };

  const columns: Column<IUserListItem>[] = [
    {
      key: "providerName",
      header: "Provider Name",
      render: (provider) => (
        <span className="user-name fw-bold text-dark">{provider.name}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (provider) => (
        <span className="user-email text-muted" style={{ fontSize: "0.8125rem" }}>
          {provider.email}
        </span>
      ),
    },
    {
      key: "appliedDate",
      header: "Applied Date",
      render: (provider) => (
        <span className="text-secondary small">{formatDate(provider.createdAt.toString())}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: () => (
        <span className="status-indicator">
          <span className="status-dot" style={{ background: "#f59e0b" }}></span>
          Pending
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (provider) => (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
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
      ),
    },
    {
      key: "profile",
      header: "Profile",
      align: "center",
      render: (provider) => (
        <button
          className="btn-action-block unblock mx-auto"
          onClick={() => handleViewProfile(provider.id)}
          disabled={fetchingDetail}
          style={{
            textTransform: "uppercase",
            background: "#f8fafc",
            color: "#334155",
            borderColor: "#e2e8f0",
          }}
        >
          {fetchingDetail && selectedProvider?._id === provider.id
            ? "Fetching..."
            : "VIEW PROFILE"}
        </button>
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
            <div className="confirm-modal-title">Approve Provider</div>
            <div className="confirm-modal-message">
              Are you sure you want to approve{" "}
              <strong>{modal.providerName}</strong>? Their account role will be
              upgraded to provider and they will be able to offer services on
              the platform.
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
          <div
            className="confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon reject">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="confirm-modal-title">Reject Provider</div>
            <div className="confirm-modal-message">
              Are you sure you want to reject{" "}
              <strong>{modal.providerName}</strong>'s provider application?
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

      <AdminPageHeader
        title="Provider Management"
        subtitle="Review pending provider applications and approve or reject them."
        breadcrumb={
          <>Admin <span className="separator">›</span> <span>Providers</span></>
        }
        actionButton={{
          label: "Refresh",
          icon: `bi bi-arrow-clockwise ${loading ? "spin" : ""}`,
          onClick: fetchProviders
        }}
      />

      <div className="admin-stats-row" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Applications</div>
          <div className="admin-stat-value orange">
            <i
              className="bi bi-hourglass-split"
              style={{ fontSize: "1.25rem", marginRight: 8 }}
            ></i>
            {loading ? "—" : total}
          </div>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Search by provider name or email..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onReset={() => {
          setSearchInput("");
          setPage(1);
        }}
      />

      <DataTable
        columns={columns}
        data={providers}
        loading={loading}
        emptyMessage="No pending provider applications found."
        emptyIcon="bi bi-person-check"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(provider) => provider.id || Math.random().toString()}
      />

      {detailModalOpen && selectedProvider && (
        <ProviderProfileModal
          provider={selectedProvider}
          onClose={() => setDetailModalOpen(false)}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `,
        }}
      />
    </div>
  );
};

export default ProviderManagement;
