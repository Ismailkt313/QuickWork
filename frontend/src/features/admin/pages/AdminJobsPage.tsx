import React, { useState, useEffect, useCallback } from 'react';
import { adminJobApi, type AdminJobFilters as FilterType } from '../services/adminJobApi';
import type { IAdminJob } from '../types/admin.types';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { RiEyeLine, RiMapPinLine } from 'react-icons/ri';
import { CustomSelect } from '../../../shared/components/ui/CustomSelect';
import { AdminPageHeader, AdminFilterBar, DataTable, type Column } from '../components/table';
import { AdminJobStatusBadge } from '../components/jobs/AdminJobStatusBadge';
import useDebounce from '../../../hooks/useDebounce';

interface AdminJobsPageProps {
  defaultType?: 'flagged' | 'payments' | 'stalled';
}

const AdminJobsPage: React.FC<AdminJobsPageProps> = ({ defaultType }) => {
  const [jobs, setJobs] = useState<IAdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [stats, setStats] = useState({ total: 0, active: 0 });

  const [filters, setFilters] = useState<FilterType>({
    page: 1,
    limit: 10,
    status: '',
    search: '',
    type: defaultType,
  });

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const [lastSearch, setLastSearch] = useState("");

  if (debouncedSearch !== lastSearch) {
    setLastSearch(debouncedSearch);
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await adminJobApi.getAllJobs(filters);
      if (response.success) {
        setJobs(response.data);
        setPagination(response.pagination);
        if (response.stats) {
          setStats({
            total: response.stats.total || 0,
            active: response.stats.active || 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(true);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const columns: Column<IAdminJob>[] = [
    {
      key: "jobId",
      header: "Job ID",
      render: (job) => (
        <div>
          <span className="badge bg-light text-dark font-monospace w-auto d-inline-block text-start mb-1">
            #{job.jobCode || 'N/A'}
          </span>
          {job.createdAt && (
            <div className="text-muted small" style={{ fontSize: 11 }}>
              {format(new Date(job.createdAt), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      header: "Job Title",
      render: (job) => (
        <div>
          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 240 }} title={job.title}>
            {job.title}
          </div>
          <div className="text-muted small" style={{ fontSize: 11, marginTop: 2 }}>
            {job.acceptedFreelancers || 0}/{job.freelancersNeeded || 1} assigned
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (job) => {
        const clientName = job.userId?.name || job.clientName || 'Unknown';
        const clientInitial = clientName[0].toUpperCase();
        return (
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                color: '#4338ca',
                flexShrink: 0,
              }}
            >
              {clientInitial}
            </div>
            <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: 130 }}>
              {clientName}
            </span>
          </div>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: (job) => (
        <div className="d-flex align-items-center gap-1">
          <RiMapPinLine size={14} className="text-muted" />
          <span className="text-muted fw-medium">{job.location?.districtName || '—'}</span>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      render: (job) => {
        const budget = job.budgetRange
          ? `₹${job.budgetRange.min.toLocaleString()} – ₹${job.budgetRange.max.toLocaleString()}`
          : job.budget
            ? `₹${job.budget.min.toLocaleString()} – ₹${job.budget.max.toLocaleString()}`
            : '—';
        return <span className="fw-bold text-dark">{budget}</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (job) => <AdminJobStatusBadge status={job.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "center",
      render: (job) => (
        <Link
          to={`/admin/jobs/${job._id || job.id}`}
          className="btn-action-view d-inline-flex align-items-center justify-content-center"
          title="View Job"
        >
          <RiEyeLine size={16} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Jobs Management"
        subtitle="Monitor, review, and moderate all platform jobs"
        breadcrumb={
          <>Admin <span className="separator">›</span> <span>Jobs</span></>
        }
      />

      <div className="admin-stats-row mb-4">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total Jobs</div>
          <div className="admin-stat-value blue">
            {stats.total.toLocaleString()}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Active Now</div>
          <div className="admin-stat-value green">
            {stats.active.toLocaleString()}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Active Rate</div>
          <div className="admin-stat-value indigo">
            {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%'}
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Inactive</div>
          <div className="admin-stat-value orange">
            {Math.max(0, stats.total - stats.active).toLocaleString()}
          </div>
        </div>
      </div>

      <AdminFilterBar
        searchPlaceholder="Search by job ID, title, or client name..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onReset={() => {
          setSearchInput("");
          setFilters({ page: 1, limit: 10, status: "", search: "", type: defaultType });
        }}
      >
        <CustomSelect
          value={filters.status}
          onChange={(v) => setFilters({ ...filters, status: v, page: 1 })}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'open', label: 'Open' },
            { value: 'partially_assigned', label: 'Partially Assigned' },
            { value: 'fully_assigned', label: 'Fully Assigned' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          size="sm"
          className="admin-filter-select-override"
        />
      </AdminFilterBar>

      <DataTable
        columns={columns}
        data={jobs}
        loading={loading}
        emptyMessage="No jobs found. Try adjusting your search or filters."
        emptyIcon="bi bi-briefcase"
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setFilters({ ...filters, page: p })}
        keyExtractor={(job) => job._id || job.id || Math.random().toString()}
      />
    </div>
  );
};

export default AdminJobsPage;
