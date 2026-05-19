import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../app/store";
import { fetchAdminReports, type Report } from "../store/adminReportSlice";
import useDebounce from "../../../hooks/useDebounce";
import { RiArrowRightLine } from "react-icons/ri";
import { CustomSelect } from "../../../shared/components/ui/CustomSelect";
import { AdminPageHeader, AdminFilterBar, DataTable, type Column } from "../components/table";

const AdminReportsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { reports, pagination, loading } = useSelector((state: RootState) => state.adminReport);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: "all",
    search: ""
  });

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [lastSearch, setLastSearch] = useState("");

  if (debouncedSearch !== lastSearch) {
    setLastSearch(debouncedSearch);
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }

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

  const columns: Column<Report>[] = [
    {
      key: "createdAt",
      header: "Date",
      render: (report) => (
        <span className="fw-bold text-dark">{new Date(report.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: "reporter",
      header: "Reporter",
      render: (report) => (
        <div className="d-flex flex-column">
          <span className="fw-bold text-dark">{report.reporterId?.name || "Unknown"}</span>
          <span className="text-muted small">{report.reporterId?.email || ""}</span>
        </div>
      ),
    },
    {
      key: "reportedUser",
      header: "Reported User",
      render: (report) => (
        <div className="d-flex flex-column">
          <span className="fw-bold text-dark">{report.reportedUserId?.name || "Unknown"}</span>
          <span className="text-muted small">{report.reportedUserId?.email || ""}</span>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (report) => <span className="text-dark">{report.reason}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (report) => getStatusBadge(report.status),
    },
    {
      key: "actions",
      header: "Action",
      align: "center",
      render: (report) => (
        <button 
          className="btn-action-view" 
          onClick={(e) => { 
            e.stopPropagation(); 
            navigate(`/admin/reports/${report._id}`); 
          }}
          title="View Report"
        >
          <RiArrowRightLine size={18} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Reports & Moderation"
        subtitle="Review user reports and take administrative action"
        breadcrumb={
          <>Admin <span className="separator">›</span> <span>Reports</span></>
        }
      />

      <AdminFilterBar
        searchPlaceholder="Search by reporter, reason..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onReset={() => {
          setSearchInput("");
          setFilters({ ...filters, status: "all", search: "", page: 1 });
        }}
      >
        <CustomSelect
          value={filters.status}
          onChange={(v) => setFilters({ ...filters, status: v, page: 1 })}
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "action_taken", label: "Action Taken" },
            { value: "rejected", label: "Rejected" },
          ]}
          size="sm"
          className="admin-filter-select-override"
        />
      </AdminFilterBar>

      <DataTable
        columns={columns}
        data={reports}
        loading={loading}
        emptyMessage="No reports found"
        emptyIcon="bi bi-flag"
        page={pagination?.page || 1}
        totalPages={pagination?.pages || 1}
        onPageChange={(p) => setFilters({ ...filters, page: p })}
        keyExtractor={(r) => r._id}
      />
    </div>
  );
};

export default AdminReportsPage;
