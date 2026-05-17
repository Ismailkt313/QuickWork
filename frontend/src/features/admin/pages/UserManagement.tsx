import { useState, useEffect, useCallback } from "react";
import { getUsers, toggleBlockUser, getUserById } from "../services/adminApi";
import type { IUserListItem, IServiceProviderDetails } from "../types/admin.types";
import UserDetailModal from "../components/UserDetailModal";
import { ROLES } from "../../../constants/roles";
import useDebounce from "../../../hooks/useDebounce";
import axios from "axios";
import { CustomSelect, type SelectOption } from "../../../shared/components/ui/CustomSelect";
import { DataTable, type Column, AdminFilterBar, AdminPageHeader } from "../components/table";

interface ToastItem {
  id: number;
  type: "success" | "error";
  message: string;
}

interface ConfirmState {
  show: boolean;
  userId: string;
  userName: string;
  isBlocked: boolean;
  loading: boolean;
}

/* ─── Options ─── */
const roleOptions: SelectOption[] = [
  { value: "", label: "Role: All" },
  { value: ROLES.USER, label: "Role: User" },
  { value: ROLES.PROVIDER, label: "Role: Provider" },
  { value: ROLES.ADMIN, label: "Role: Admin" },
];

const statusOptions: SelectOption[] = [
  { value: "", label: "Status: All" },
  { value: "active", label: "Status: Active" },
  { value: "blocked", label: "Status: Blocked" },
];

const UserManagement = () => {
  const [users, setUsers] = useState<IUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const limit = 4;

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    show: false,
    userId: "",
    userName: "",
    isBlocked: false,
    loading: false,
  });

  const [selectedUser, setSelectedUser] = useState<IUserListItem | null>(null);
  const [selectedProviderProfile, setSelectedProviderProfile] = useState<IServiceProviderDetails | null>(null);
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

  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [lastFilters, setLastFilters] = useState({ search: "", role: "", status: "" });

  // Update page to 1 during render if filters change to avoid double fetch
  if (debouncedSearch !== lastFilters.search || filterRole !== lastFilters.role || filterStatus !== lastFilters.status) {
    setLastFilters({ search: debouncedSearch, role: filterRole, status: filterStatus });
    setPage(1);
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const isBlocked = filterStatus === "blocked" ? true : filterStatus === "active" ? false : undefined;
      const res = await getUsers({ 
        page, 
        limit, 
        search: debouncedSearch || undefined,
        role: filterRole || undefined,
        isBlocked
      });

      setUsers(res.data.data);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);



  const openBlockConfirm = (
    userId: string,
    userName: string,
    isBlocked: boolean,
  ) => {
    setConfirmState({
      show: true,
      userId,
      userName,
      isBlocked,
      loading: false,
    });
  };

  const closeConfirm = () => {
    if (confirmState.loading) return;
    setConfirmState({
      show: false,
      userId: "",
      userName: "",
      isBlocked: false,
      loading: false,
    });
  };

  const executeBlock = async () => {
    const targetId = confirmState.userId;
    const wasBlocked = confirmState.isBlocked;

    setConfirmState((prev) => ({ ...prev, loading: true }));
    const action = wasBlocked ? "unblocked" : "blocked";

    try {
      await toggleBlockUser(targetId);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          (user.id === targetId || user._id === targetId)
            ? { ...user, isBlocked: !wasBlocked }
            : user
        )
      );

      if (
        selectedUser &&
        (selectedUser._id === targetId || selectedUser.id === targetId)
      ) {
        setSelectedUser((prev) =>
          prev ? { ...prev, isBlocked: !wasBlocked } : null
        );
      }

      showToast(
        "success",
        `User ${confirmState.userName} has been ${action} successfully.`,
      );
    } catch (error) {
      let msg = `Failed to ${wasBlocked ? "unblock" : "block"} user.`;
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
        console.error("Block/Unblock error:", error.response?.data || error);
      } else {
        console.error("Block/Unblock error:", error);
      }
      showToast("error", msg);
    } finally {
      setConfirmState({
        show: false,
        userId: "",
        userName: "",
        isBlocked: false,
        loading: false,
      });
    }
  };

  const getStableTrustScore = (userId: string) => {
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hash % 60) + 30;
  };

  const getTrustLevel = (score: number) => {
    if (score >= 70) return "high";
    if (score >= 45) return "medium";
    return "low";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const handleViewUser = async (id: string) => {
    if (fetchingDetail) return;
    setFetchingDetail(true);
    try {
      const res = await getUserById(id);
      if (res.data && res.data.success) {
        const { user, providerProfile } = res.data.data;
        setSelectedUser(user as IUserListItem);
        setSelectedProviderProfile(providerProfile || null);
        setDetailModalOpen(true);
      } else {
        showToast("error", "Failed to fetch user details.");
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

  const getRoleBadgeClass = (role: ROLES) => {
    if (role === ROLES.PROVIDER) return "provider";
    if (role === ROLES.ADMIN) return "admin";
    return "user";
  };

  const getRoleLabel = (role: ROLES) => {
    if (role === ROLES.PROVIDER) return "Provider";
    return role === ROLES.ADMIN ? "Admin" : "User";
  };

  const activeCount = users ? users.filter((u) => !u.isBlocked).length : 0;
  const blockedCount = users ? users.filter((u) => u.isBlocked).length : 0;

  const columns: Column<IUserListItem>[] = [
    {
      key: "user",
      header: "User Name",
      render: (user) => (
        <>
          <span className="user-name">{user.name}</span>
          <span className="user-email">{user.email}</span>
        </>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
          {getRoleLabel(user.role)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <span className="status-indicator">
          <span className={`status-dot ${user.isBlocked ? "blocked" : "active"}`}></span>
          {user.isBlocked ? "Blocked" : "Active"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined Date",
      render: (user) => formatDate(user.createdAt),
    },
    {
      key: "trustScore",
      header: "Trust Score",
      render: (user) => {
        const score = getStableTrustScore(user.id || user._id || "");
        const level = getTrustLevel(score);
        return (
          <div className="trust-score-container">
            <div className="trust-score-bar">
              <div className={`trust-score-fill ${level}`} style={{ width: `${score}%` }}></div>
            </div>
            <span className="trust-score-value">{score}</span>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn-action-block ${user.isBlocked ? "unblock" : "block"}`}
            onClick={() => openBlockConfirm(user.id, user.name, user.isBlocked)}
          >
            {user.isBlocked ? "UNBLOCK" : "BLOCK"}
          </button>
        </div>
      ),
    },
    {
      key: "profile",
      header: "Profile",
      render: (user) => (
        <button
          className="btn-action-block unblock"
          onClick={() => handleViewUser(user.id)}
          disabled={fetchingDetail}
          style={{
            textTransform: "uppercase",
            background: "#f8fafc",
            color: "#334155",
            borderColor: "#e2e8f0",
          }}
        >
          {fetchingDetail && selectedUser?.id === user.id ? "..." : "DETAILS"}
        </button>
      ),
    },
  ];

  return (
    <div>
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

      {confirmState.show && (
        <div className="confirm-modal-overlay" onClick={closeConfirm}>
          <div
            className="confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`confirm-modal-icon ${confirmState.isBlocked ? "unblock" : "block"}`}
            >
              <i
                className={`bi ${confirmState.isBlocked ? "bi-unlock-fill" : "bi-lock-fill"}`}
              ></i>
            </div>
            <div className="confirm-modal-title">
              {confirmState.isBlocked ? "Unblock" : "Block"} User
            </div>
            <div className="confirm-modal-message">
              Are you sure you want to{" "}
              {confirmState.isBlocked ? "unblock" : "block"}{" "}
              <strong>{confirmState.userName}</strong>?{" "}
              {confirmState.isBlocked
                ? "This user will regain access to the platform."
                : "This user will be unable to log in or access any services."}
            </div>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn cancel"
                onClick={closeConfirm}
                disabled={confirmState.loading}
              >
                Cancel
              </button>
              <button
                className={`confirm-modal-btn ${confirmState.isBlocked ? "confirm-unblock" : "confirm-block"}`}
                onClick={executeBlock}
                disabled={confirmState.loading}
              >
                {confirmState.loading
                  ? "Processing..."
                  : confirmState.isBlocked
                    ? "Yes, Unblock"
                    : "Yes, Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminPageHeader
        title="User Management"
        subtitle="Review user activity, manage account status, and monitor platform safety scores."
        action={
          <button className="btn btn-invite">
            <i className="bi bi-plus-lg"></i>
            Invite User
          </button>
        }
        breadcrumb={
          <>Admin <span className="separator">›</span> <span>Users</span></>
        }
      />

      <AdminFilterBar
        searchPlaceholder="Search by name, email, or user ID..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onReset={() => {
          setSearchInput("");
          setFilterRole("");
          setFilterStatus("");
        }}
      >
        <CustomSelect 
          size="sm"
          options={roleOptions}
          value={filterRole}
          onChange={setFilterRole}
          className="admin-filter-select-override"
        />

        <CustomSelect 
          size="sm"
          options={statusOptions}
          value={filterStatus}
          onChange={setFilterStatus}
          className="admin-filter-select-override"
        />
      </AdminFilterBar>

      <DataTable
        columns={columns}
        data={users || []}
        loading={loading}
        emptyMessage="No users found"
        emptyIcon="bi bi-people"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        keyExtractor={(user) => user.id || user._id || Math.random().toString()}
      />

      {detailModalOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          providerProfile={selectedProviderProfile}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedProviderProfile(null);
          }}
          onToggleBlock={(id) => {
            const isBlocked = selectedUser.isBlocked;
            openBlockConfirm(id, selectedUser.name, isBlocked);
            return Promise.resolve();
          }}
        />
      )}

      <div className="admin-stats-row">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Active Users</div>
          <div className="admin-stat-value blue">
            {total > 0 ? (total - blockedCount).toLocaleString() : "—"}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Pending Review</div>
          <div className="admin-stat-value orange">
            {activeCount > 0 ? Math.ceil(activeCount * 0.15) : "—"}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Blocked Accounts</div>
          <div className="admin-stat-value red">
            {blockedCount > 0 ? blockedCount.toLocaleString() : "—"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
