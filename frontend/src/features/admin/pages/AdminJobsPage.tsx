import React, { useState, useEffect, useCallback } from 'react';
import { AdminJobHeader } from '../components/jobs/AdminJobHeader';
import { AdminJobFilters } from '../components/jobs/AdminJobFilters';
import { AdminJobTable } from '../components/jobs/AdminJobTable';
import { adminJobApi, type AdminJobFilters as FilterType } from '../services/adminJobApi';
import { IAdminJob } from '../types/admin.types';
import { toast } from 'react-toastify';
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';

const AdminJobsPage: React.FC = () => {
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
  });

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
    const id = setTimeout(fetchJobs, 300);
    return () => clearTimeout(id);
  }, [fetchJobs]);

  const handlePageChange = (newPage: number) =>
    setFilters({ ...filters, page: newPage });

  const handleClearFilters = () =>
    setFilters({ page: 1, limit: 10, status: '', search: '' });

  const recordStart = (pagination.page - 1) * pagination.limit + 1;
  const recordEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div
      className="font-['Outfit']"
      style={{ padding: '28px 24px', maxWidth: 1400, margin: '0 auto' }}
    >
      <AdminJobHeader stats={stats} />

      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            background: '#fafafa',
          }}
        >
          <AdminJobFilters
            filters={filters}
            setFilters={setFilters}
            onClear={handleClearFilters}
          />
        </div>

        <AdminJobTable
          jobs={jobs}
          loading={loading}
          error={error}
          onRefresh={fetchJobs}
        />

        {!loading && jobs.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              background: '#fafafa',
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
              }}
            >
              Showing{' '}
              <strong style={{ color: '#0f172a' }}>
                {recordStart}–{recordEnd}
              </strong>{' '}
              of{' '}
              <strong style={{ color: '#0f172a' }}>{pagination.total}</strong>{' '}
              jobs
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '7px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 9,
                  background: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasPrev ? 1 : 0.4,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                <RiArrowLeftSLine size={16} />
                Previous
              </button>

              <span
                style={{
                  padding: '7px 14px',
                  borderRadius: 9,
                  background: '#6366f1',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  minWidth: 36,
                  textAlign: 'center',
                }}
              >
                {pagination.page}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '7px 14px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 9,
                  background: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#334155',
                  cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasNext ? 1 : 0.4,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                Next
                <RiArrowRightSLine size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobsPage;
