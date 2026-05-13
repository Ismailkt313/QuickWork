import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RiArrowLeftLine,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiUser3Line,
  RiCalendarLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiBriefcase4Line,
  RiTeamLine,
  RiHistoryLine,
} from 'react-icons/ri';
import { adminJobApi } from '../services/adminJobApi';
import { AdminJobStatusBadge } from '../components/jobs/AdminJobStatusBadge';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { AdminCancelModal } from '../components/jobs/AdminCancelModal';
import type { IAdminJob } from '../types/admin.types';
import { useCallback } from 'react';

const fmt = (d?: string) =>
  d ? format(new Date(d), 'MMM d, yyyy · h:mm a') : '—';

const InfoRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9',
    }}
  >
    <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', flexShrink: 0 }}>
      {label}
    </span>
    <span
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#0f172a',
        textAlign: 'right',
        fontFamily: mono ? 'monospace' : 'inherit',
        wordBreak: 'break-word',
      }}
    >
      {value}
    </span>
  </div>
);

const Card = ({
  icon,
  title,
  children,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    }}
  >
    <div
      style={{
        padding: '14px 20px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#fafafa',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: accent || '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 800,
          color: '#0f172a',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
    </div>
    <div style={{ padding: '4px 20px 16px' }}>{children}</div>
  </div>
);

const AdminJobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<IAdminJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, jobTitle: '' });

  const fetchDetails = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await adminJobApi.getJobDetails(jobId);
      if (res.success) setJob(res.data);
    } catch {
      toast.error('Failed to load job details');
      navigate('/admin/jobs');
    } finally {
      setLoading(false);
    }
  }, [jobId, navigate]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const handleCancelConfirm = async (reason: string) => {
    const res = await adminJobApi.cancelJob(jobId!, reason);
    if (res.success) { toast.success(res.message); fetchDetails(); }
    else throw new Error(res.message);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 14px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading job details…</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <RiAlertLine size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Job not found</h3>
          <button onClick={() => navigate('/admin/jobs')} style={{ marginTop: 16, padding: '9px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Back to Jobs</button>
        </div>
      </div>
    );
  }

  const clientName = job.userId?.name || job.clientName || 'Unknown';
  const district = job.location?.districtName || '—';
  const address = job.location?.address || '—';
  const budget = `₹${(job.budget?.min || 0).toLocaleString()} – ₹${(job.budget?.max || 0).toLocaleString()}`;
  const duration = job.durationType?.replaceAll('_', ' ') || '—';
  const isCancelled = job.status === 'cancelled';

  return (
    <div
      className="font-['Outfit']"
      style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <button
            onClick={() => navigate('/admin/jobs')}
            style={{ width: 40, height: 40, border: '1.5px solid #e2e8f0', borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', flexShrink: 0, marginTop: 3, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            <RiArrowLeftLine size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {job.title || 'Untitled Job'}
              </h1>
              <AdminJobStatusBadge status={job.status} />
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
              Job #{job.jobCode || '—'} &nbsp;·&nbsp; Posted {fmt(job.createdAt)}
            </p>
          </div>
        </div>

        {!isCancelled && (
          <button
            onClick={() => setCancelModal({ isOpen: true, jobTitle: job.title })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: '#fff', border: '1.5px solid #fecaca', borderRadius: 11, fontSize: 12, fontWeight: 700, color: '#dc2626', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(239,68,68,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            <RiAlertLine size={15} />
            Cancel Job
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 20, alignItems: 'start' }}
        className="detail-grid"
      >
        <style>{`@media(max-width:900px){.detail-grid{grid-template-columns:1fr!important}}`}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card
            icon={<RiBriefcase4Line size={16} color="#6366f1" />}
            title="Job Description"
            accent="#eef2ff"
          >
            <p style={{ margin: '14px 0 0', fontSize: 14, color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {job.description || 'No description provided.'}
            </p>
          </Card>

          <Card
            icon={<RiCalendarLine size={16} color="#0284c7" />}
            title="Job Details"
            accent="#e0f2fe"
          >
            <div style={{ marginTop: 4 }}>
              <InfoRow label="Duration Type" value={duration} />
              <InfoRow label="Start Date" value={job.startDate ? format(new Date(job.startDate), 'MMM d, yyyy') : '—'} />
              <InfoRow label="End date" value={job.endDate ? format(new Date(job.endDate), 'MMM d, yyyy') : '—'} />
              {job.durationType === 'multi_day' && (
                <InfoRow label="Number of Days" value={`${job.days || '—'} days`} />
              )}
              <InfoRow label="Providers Needed" value={`${job.freelancersNeeded || 1}`} />
              <InfoRow label="Providers Hired" value={`${job.acceptedFreelancers || 0} / ${job.freelancersNeeded || 1}`} />
              <InfoRow label="Contact Number" value={job.clientNumber || '—'} />
            </div>
          </Card>

          <Card
            icon={<RiMapPinLine size={16} color="#16a34a" />}
            title="Location"
            accent="#f0fdf4"
          >
            <div style={{ marginTop: 4 }}>
              <InfoRow label="District" value={district} />
              <InfoRow label="Address" value={address} />
              {job.location?.additionalDetails && (
                <InfoRow label="Additional Info" value={job.location.additionalDetails} />
              )}
            </div>
          </Card>

          <Card
            icon={<RiUser3Line size={16} color="#d97706" />}
            title="Stakeholders"
            accent="#fffbeb"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#e0e7ff,#c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#4338ca', flexShrink: 0 }}>
                  {clientName[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Client</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{clientName}</div>
                </div>
              </div>

            </div>

            {job.hiredProviderId ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#fef3c7,#fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#92400e', flexShrink: 0 }}>
                    <RiTeamLine size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Assigned Provider</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{job.hiredProviderName || 'Provider'}</div>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ padding: '16px 0 4px', fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
                No provider assigned yet.
              </div>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 24 }}>
          <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 18, padding: '22px 20px', color: '#fff', boxShadow: '0 6px 24px rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <RiMoneyDollarCircleLine size={18} color="rgba(255,255,255,0.7)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>Budget Range</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6 }}>{budget}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Per provider · {duration}</div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Min per provider</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>₹{(job.budget?.min || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Max per provider</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>₹{(job.budget?.max || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Card
            icon={<RiShieldCheckLine size={16} color={isCancelled ? '#dc2626' : '#16a34a'} />}
            title="Status Overview"
            accent={isCancelled ? '#fef2f2' : '#f0fdf4'}
          >
            <div style={{ marginTop: 4 }}>
              <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>Current Status</span>
                <AdminJobStatusBadge status={job.status} />
              </div>
              <InfoRow label="Posted" value={fmt(job.createdAt)} />
              {isCancelled && <InfoRow label="Cancelled" value={fmt(job.cancelledAt)} />}
              <InfoRow label="Visibility" value={job.visibility || 'Public'} />
            </div>
          </Card>

          {job.cancelledByAdmin && (
            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <RiAlertLine size={15} color="#dc2626" />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Cancellation</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#7f1d1d', lineHeight: 1.7, fontWeight: 500 }}>
                {job.adminCancellationReason || 'No reason recorded.'}
              </p>
            </div>
          )}

          <Card
            icon={<RiHistoryLine size={16} color="#64748b" />}
            title="Activity Timeline"
            accent="#f8fafc"
          >
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ position: 'relative', paddingLeft: 22, paddingBottom: 20 }}>
                <div style={{ position: 'absolute', left: 0, top: 5, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', boxShadow: '0 0 0 2px #22c55e' }} />
                <div style={{ position: 'absolute', left: 4, top: 18, bottom: 0, width: 2, background: '#f1f5f9', borderRadius: 2 }} />
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Job Posted</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{fmt(job.createdAt)}</div>
              </div>

              {job.acceptedFreelancers > 0 && (
                <div style={{ position: 'relative', paddingLeft: 22, paddingBottom: 20 }}>
                  <div style={{ position: 'absolute', left: 0, top: 5, width: 10, height: 10, borderRadius: '50%', background: '#6366f1', border: '2px solid #fff', boxShadow: '0 0 0 2px #6366f1' }} />
                  <div style={{ position: 'absolute', left: 4, top: 18, bottom: 0, width: 2, background: '#f1f5f9', borderRadius: 2 }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Provider Assigned</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{job.acceptedFreelancers} of {job.freelancersNeeded}</div>
                </div>
              )}

              {isCancelled && (
                <div style={{ position: 'relative', paddingLeft: 22 }}>
                  <div style={{ position: 'absolute', left: 0, top: 5, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', boxShadow: '0 0 0 2px #ef4444' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 2 }}>Job Cancelled</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{fmt(job.cancelledAt)}</div>
                </div>
              )}

              {job.status === 'completed' && (
                <div style={{ position: 'relative', paddingLeft: 22 }}>
                  <div style={{ position: 'absolute', left: 0, top: 5, width: 10, height: 10, borderRadius: '50%', background: '#0ea5e9', border: '2px solid #fff', boxShadow: '0 0 0 2px #0ea5e9' }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Job Completed</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>All deliverables fulfilled</div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AdminCancelModal
        isOpen={cancelModal.isOpen}
        jobTitle={cancelModal.jobTitle}
        onClose={() => setCancelModal({ ...cancelModal, isOpen: false })}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default AdminJobDetailPage;