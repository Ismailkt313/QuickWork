import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchAdminReports } from "../store/adminReportSlice";
import {
  RiFlagLine,
  RiFilter3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLoader4Line,
  RiShieldUserLine,
  RiArrowRightLine
} from "react-icons/ri";

const AdminReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { reports, pagination, loading } = useSelector((state: RootState) => state.adminReport);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all"
  });

  useEffect(() => {
    dispatch(fetchAdminReports(filters));
  }, [dispatch, filters]);

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
      <span
        className="badge rounded-pill fw-bold"
        style={{ background: config.bg, color: config.text, fontSize: "12px", padding: "5px 12px" }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-dark p-3 rounded-4 text-white shadow-sm">
          <RiShieldUserLine size={32} />
        </div>
        <div>
          <h2 className="fw-bold text-dark mb-1">Reports & Moderation</h2>
          <p className="text-muted mb-0">Review user reports and take administrative action</p>
        </div>
      </div>

      {}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-4 border-bottom">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                <RiFilter3Line size={14} className="me-1" /> Status
              </label>
              <select
                className="form-select border rounded-3 py-2"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="action_taken">Action Taken</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="py-3 px-4 border-0">Date</th>
                <th className="py-3 px-4 border-0">Reporter</th>
                <th className="py-3 px-4 border-0">Reported User</th>
                <th className="py-3 px-4 border-0">Reason</th>
                <th className="py-3 px-4 border-0">Status</th>
                <th className="py-3 px-4 border-0 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <RiLoader4Line size={40} className="qw-spin text-primary mb-2" />
                    <p className="text-muted mb-0">Loading reports...</p>
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((report) => (
                  <tr key={report._id} style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/reports/${report._id}`)}>
                    <td className="py-3 px-4">
                      <span className="fw-bold text-dark">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{report.reporterId?.name || "Unknown"}</span>
                        <span className="text-muted small">{report.reporterId?.email || ""}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-dark">{report.reportedUserId?.name || "Unknown"}</span>
                        <span className="text-muted small">{report.reportedUserId?.email || ""}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-dark">{report.reason}</span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center gap-1 mx-auto" onClick={(e) => { e.stopPropagation(); navigate(`/admin/reports/${report._id}`); }}>
                        View <RiArrowRightLine size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <RiFlagLine size={48} className="text-muted mb-3 opacity-25" />
                    <p className="text-muted fw-medium fs-5">No reports found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="card-footer bg-white p-4 border-top d-flex justify-content-between align-items-center">
            <span className="text-muted small">
              Page <span className="fw-bold">{pagination.page}</span> of <span className="fw-bold">{pagination.pages}</span>
            </span>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
                <RiArrowLeftSLine size={18} /> Previous
              </button>
              <button className="btn btn-outline-secondary btn-sm rounded-3 px-3" disabled={filters.page === pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
                Next <RiArrowRightSLine size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .qw-spin { animation: qw-spin 1s linear infinite; }
        @keyframes qw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminReportsPage;
