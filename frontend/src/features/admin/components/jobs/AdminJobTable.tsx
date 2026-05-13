import React from 'react';
import { Link } from 'react-router-dom';
import { RiEyeLine, RiAlertLine, RiSearchLine, RiMapPinLine, RiUser3Line } from 'react-icons/ri';
import { AdminJobStatusBadge } from './AdminJobStatusBadge';
import { format } from 'date-fns';
import type { IAdminJob } from '../../types/admin.types';

interface AdminJobTableProps {
  jobs: IAdminJob[];
  loading: boolean;
  error?: boolean;
  onRefresh: () => void;
}

export const AdminJobTable: React.FC<AdminJobTableProps> = ({
  jobs,
  loading,
  error,
  onRefresh,
}) => {
  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #e2e8f0',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0,
          }}
        >
          Loading jobs…
        </p>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <div style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <RiAlertLine size={26} color="#ef4444" />
        </div>
        <h3
          style={{
            margin: '0 0 6px',
            fontSize: 14,
            fontWeight: 800,
            color: '#0f172a',
          }}
        >
          Failed to load jobs
        </h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#94a3b8' }}>
          There was an error fetching data from the server.
        </p>
        <button
          onClick={onRefresh}
          style={{
            padding: '9px 20px',
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ─── Empty state ─── */
  if (jobs.length === 0) {
    return (
      <div style={{ padding: '72px 24px', textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <RiSearchLine size={28} color="#cbd5e1" />
        </div>
        <h3
          style={{
            margin: '0 0 6px',
            fontSize: 15,
            fontWeight: 800,
            color: '#0f172a',
          }}
        >
          No jobs found
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  /* ─── Desktop Table ─── */
  return (
    <div className="font-['Outfit']">
      <style>{`
        .qw-admin-desktop-jobs { display: block; }
        .qw-admin-mobile-jobs { display: none; }

        @media (max-width: 1023px) {
          .qw-admin-desktop-jobs { display: none !important; }
          .qw-admin-mobile-jobs { display: flex !important; }
        }
      `}</style>

      {/* Desktop */}
      <div className="qw-admin-desktop-jobs">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Job ID', 'Job Title', 'Client', 'Location', 'Budget', 'Status', ''].map(
                (col) => (
                  <th
                    key={col}
                    style={{
                      padding: '11px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      whiteSpace: 'nowrap',
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, idx) => {
              const createdDate = job.createdAt
                ? format(new Date(job.createdAt), 'MMM d, yyyy')
                : '';
              const district = job.location?.districtName || '—';
              const budget = job.budgetRange
                ? `₹${job.budgetRange.min.toLocaleString()} – ₹${job.budgetRange.max.toLocaleString()}`
                : job.budget
                  ? `₹${job.budget.min.toLocaleString()} – ₹${job.budget.max.toLocaleString()}`
                  : '—';
              const clientName =
                job.userId?.name || job.clientName || 'Unknown';
              const clientInitial = clientName[0].toUpperCase();

              return (
                <tr
                  key={job._id || job.id}
                  style={{
                    background: idx % 2 === 0 ? '#fff' : '#fafafa',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#f1f5f9')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? '#fff' : '#fafafa')
                  }
                >
                  {/* Job ID */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <div>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#6366f1',
                          background: '#eef2ff',
                          padding: '3px 8px',
                          borderRadius: 6,
                        }}
                      >
                        #{job.jobCode || 'N/A'}
                      </span>
                      {createdDate && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                            color: '#94a3b8',
                            fontWeight: 500,
                          }}
                        >
                          {createdDate}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td style={{ padding: '14px 16px', maxWidth: 260 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 240,
                      }}
                      title={job.title}
                    >
                      {job.title}
                    </div>
                    <div
                      style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}
                    >
                      {job.acceptedFreelancers || 0}/{job.freelancersNeeded || 1} assigned
                    </div>
                  </td>

                  {/* Client */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#334155',
                          maxWidth: 130,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {clientName}
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <RiMapPinLine size={13} color="#94a3b8" />
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                        {district}
                      </span>
                    </div>
                  </td>

                  {/* Budget */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {budget}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <AdminJobStatusBadge status={job.status} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <Link
                      to={`/admin/jobs/${job._id || job.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 14px',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: 9,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#334155',
                        textDecoration: 'none',
                        background: '#fff',
                        transition: 'all 0.15s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0f172a';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = '#0f172a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#334155';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <RiEyeLine size={14} />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="qw-admin-mobile-jobs" style={{ padding: 16, flexDirection: 'column', gap: 12 }}>
        {jobs.map((job) => {
          const clientName = job.userId?.name || job.clientName || 'Unknown';
          const budget = job.budgetRange
            ? `₹${job.budgetRange.min.toLocaleString()} – ₹${job.budgetRange.max.toLocaleString()}`
            : job.budget
              ? `₹${job.budget.min.toLocaleString()} – ₹${job.budget.max.toLocaleString()}`
              : '—';
          const district = job.location?.districtName || '—';

          return (
            <div
              key={job._id || job.id}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Top row: ID + badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#6366f1',
                    background: '#eef2ff',
                    padding: '3px 8px',
                    borderRadius: 6,
                  }}
                >
                  #{job.jobCode || 'N/A'}
                </span>
                <AdminJobStatusBadge status={job.status} />
              </div>

              {/* Title */}
              <h4
                style={{
                  margin: '0 0 10px',
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.3,
                }}
              >
                {job.title}
              </h4>

              {/* Meta grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 2,
                    }}
                  >
                    Client
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <RiUser3Line size={12} color="#6366f1" />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#334155',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 120,
                      }}
                    >
                      {clientName}
                    </span>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 2,
                    }}
                  >
                    Budget
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {budget}
                  </span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 2,
                    }}
                  >
                    District
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <RiMapPinLine size={12} color="#94a3b8" />
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                      {district}
                    </span>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 2,
                    }}
                  >
                    Assigned
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                    {job.acceptedFreelancers || 0}/{job.freelancersNeeded || 1}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Link
                to={`/admin/jobs/${job._id || job.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  height: 42,
                  background: '#0f172a',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
              >
                <RiEyeLine size={15} />
                View Details
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
