import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchReportDetail, takeReportAction, clearSelectedReport } from "../store/adminReportSlice";
import { toast } from "react-hot-toast";
import {
  RiArrowLeftLine,
  RiShieldUserLine,
  RiAlertLine,
  RiForbidLine,
  RiCloseLine,
  RiLoader4Line,
  RiUserLine,
  RiFlagLine,
  RiTimeLine,
  RiMailLine,
  RiHistoryLine
} from "react-icons/ri";

const AdminReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedReport, moderationLogs, loading, actionLoading } = useSelector(
    (state: RootState) => state.adminReport
  );

  const [actionModal, setActionModal] = useState<{ show: boolean; type: "warn" | "block" | "reject" | null }>({
    show: false,
    type: null,
  });
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchReportDetail(id));
    return () => { dispatch(clearSelectedReport()); };
  }, [dispatch, id]);

  const handleAction = async () => {
    if (!id || !actionModal.type || !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      await dispatch(takeReportAction({ reportId: id, action: actionModal.type, reason })).unwrap();
      toast.success(`Action '${actionModal.type}' taken successfully`);
      setActionModal({ show: false, type: null });
      setReason("");
    } catch (_e: unknown) {
      toast.error((_e as string) || "Failed to take action");
    }
  };

  const isProcessed = selectedReport?.status === "action_taken" || selectedReport?.status === "rejected";

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
      reviewed: { bg: "#dbeafe", text: "#1e40af", label: "Reviewed" },
      action_taken: { bg: "#dcfce7", text: "#166534", label: "Action Taken" },
      rejected: { bg: "#fef2f2", text: "#991b1b", label: "Rejected" },
      resolved: { bg: "#f0fdf4", text: "#166534", label: "Resolved" },
    };
    const config = map[status] || { bg: "#f1f5f9", text: "#475569", label: status };
    return (
      <span className="badge rounded-pill fw-bold" style={{ background: config.bg, color: config.text, fontSize: "13px", padding: "6px 16px" }}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <RiLoader4Line size={48} className="qw-spin text-primary" />
      </div>
    );
  }

  if (!selectedReport) {
    return (
      <div className="text-center py-5">
        <p className="text-muted fs-5">Report not found</p>
        <button className="btn btn-primary" onClick={() => navigate("/admin/reports")}>Back to Reports</button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <button className="btn btn-light rounded-3 d-flex align-items-center gap-2 mb-4 shadow-sm" onClick={() => navigate("/admin/reports")}>
        <RiArrowLeftLine size={18} /> Back to Reports
      </button>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-danger bg-opacity-10 p-3 rounded-4 text-danger">
                  <RiFlagLine size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Report Details</h4>
                  <span className="text-muted small">
                    <RiTimeLine size={14} className="me-1" />
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {getStatusBadge(selectedReport.status)}
            </div>

            <div className="mb-4">
              <h6 className="fw-bold text-muted text-uppercase small mb-2">Reason</h6>
              <p className="fw-bold text-dark fs-5 mb-0">{selectedReport.reason}</p>
            </div>

            {selectedReport.description && (
              <div className="mb-4">
                <h6 className="fw-bold text-muted text-uppercase small mb-2">Description</h6>
                <p className="text-dark mb-0">{selectedReport.description}</p>
              </div>
            )}

            {selectedReport.images && selectedReport.images.length > 0 && (
              <div>
                <h6 className="fw-bold text-muted text-uppercase small mb-2">Evidence</h6>
                <div className="d-flex gap-2 flex-wrap">
                  {selectedReport.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Evidence ${idx + 1}`} className="rounded-3 border" style={{ width: 120, height: 120, objectFit: "cover" }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {moderationLogs.length > 0 && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <RiHistoryLine size={20} className="text-primary" />
                <h5 className="fw-bold mb-0">Moderation History</h5>
              </div>
              <div className="d-flex flex-column gap-3">
                {moderationLogs.map((log) => (
                  <div key={log._id} className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`badge rounded-pill fw-bold ${log.action === "warn" ? "bg-warning text-dark" : log.action === "block" ? "bg-danger" : "bg-secondary"}`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className="text-muted small">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mb-1 text-dark">{log.reason}</p>
                    <span className="text-muted small">By: {log.adminId?.name || "Admin"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold text-muted text-uppercase small mb-3">Reporter</h6>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                <RiUserLine size={20} />
              </div>
              <div>
                <span className="fw-bold text-dark d-block">{selectedReport.reporterId?.name}</span>
                <span className="text-muted small d-flex align-items-center gap-1">
                  <RiMailLine size={12} /> {selectedReport.reporterId?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold text-muted text-uppercase small mb-3">Reported User</h6>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-danger bg-opacity-10 p-2 rounded-3 text-danger">
                <RiShieldUserLine size={20} />
              </div>
              <div>
                <span className="fw-bold text-dark d-block">{selectedReport.reportedUserId?.name}</span>
                <span className="text-muted small d-flex align-items-center gap-1">
                  <RiMailLine size={12} /> {selectedReport.reportedUserId?.email}
                </span>
              </div>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              {selectedReport.reportedUserId.isBlocked && (
                <span className="badge bg-danger rounded-pill">Blocked</span>
              )}
              {selectedReport.reportedUserId.warningCount !== undefined && selectedReport.reportedUserId.warningCount > 0 && (
                <span className="badge bg-warning text-dark rounded-pill">
                  {selectedReport.reportedUserId.warningCount} Warning(s)
                </span>
              )}
            </div>
          </div>

          {!isProcessed && (
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h6 className="fw-bold text-muted text-uppercase small mb-3">Take Action</h6>
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-warning text-dark fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={() => setActionModal({ show: true, type: "warn" })}
                  disabled={actionLoading}
                >
                  <RiAlertLine size={18} /> Issue Warning
                </button>
                <button
                  className="btn btn-danger fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={() => setActionModal({ show: true, type: "block" })}
                  disabled={actionLoading}
                >
                  <RiForbidLine size={18} /> Block User
                </button>
                <button
                  className="btn btn-outline-secondary fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2 py-2"
                  onClick={() => setActionModal({ show: true, type: "reject" })}
                  disabled={actionLoading}
                >
                  <RiCloseLine size={18} /> Reject Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {actionModal.show && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {actionModal.type === "warn" ? "Issue Warning" : actionModal.type === "block" ? "Block User" : "Reject Report"}
                </h5>
                <button className="btn-close" onClick={() => { setActionModal({ show: false, type: null }); setReason(""); }} />
              </div>
              <div className="modal-body">
                {actionModal.type === "block" && (
                  <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2 mb-3">
                    <RiForbidLine size={18} />
                    <span className="fw-medium small">This will immediately block the user's account. They will not be able to log in.</span>
                  </div>
                )}
                <label className="form-label fw-bold small">Reason <span className="text-danger">*</span></label>
                <textarea
                  className="form-control border rounded-3"
                  rows={4}
                  placeholder="Provide a detailed reason for this action..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-light rounded-3" onClick={() => { setActionModal({ show: false, type: null }); setReason(""); }}>
                  Cancel
                </button>
                <button
                  className={`btn fw-bold rounded-3 ${actionModal.type === "block" ? "btn-danger" : actionModal.type === "warn" ? "btn-warning text-dark" : "btn-secondary"}`}
                  onClick={handleAction}
                  disabled={actionLoading || !reason.trim()}
                >
                  {actionLoading ? <RiLoader4Line size={18} className="qw-spin" /> : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .qw-spin { animation: qw-spin 1s linear infinite; }
        @keyframes qw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminReportDetailPage;
