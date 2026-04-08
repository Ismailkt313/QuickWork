import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiErrorWarningLine, RiGroupLine, RiUserAddLine } from 'react-icons/ri';
import { useJobDetails } from '../hooks/useJobDetails';
import JobDetailHeader from '../components/JobDetailHeader';
import JobInfoCard from '../components/JobInfoCard';
import JobActionPanel from '../components/JobActionPanel';
import UniversalActionModal from '../components/UniversalActionModal';
import ActionErrorModal from '../components/ActionErrorModal';
import { RiMapPinUserLine, RiMapPinRangeLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { useProviderLocation } from '../hooks/useProviderLocation';
import { acceptJob, getMyProfile } from '../services/provider.service';
import VerificationPendingModal from '../components/VerificationPendingModal';

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams() as { jobId: string };
  const navigate = useNavigate();
  const { job, loading, error } = useJobDetails(jobId);
  const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);
  const [isAccepting, setIsAccepting] = React.useState(false);
  const [actionError, setActionError] = React.useState<{isOpen: boolean, title: string, message: string}>({
      isOpen: false,
      title: '',
      message: ''
  });
  const [verificationStatus, setVerificationStatus] = React.useState<string>('pending');
  const [isPendingModalOpen, setIsPendingModalOpen] = React.useState(false);

  const providerLocation = useProviderLocation();

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getMyProfile();
        if (response.success && response.data) {
          setVerificationStatus(response.data.verificationStatus || 'pending');
        }
      } catch (err) {
        console.error('Error fetching profile status:', err);
      }
    };
    fetchStatus();
  }, []);

  const handleBack = () => {
    navigate('/provider/available-jobs');
  };

  const handleAccept = () => {
    if (verificationStatus === 'pending') {
      setIsPendingModalOpen(true);
      return;
    }
    // Logic: If job location is different from provider location, show modal
    if (job && job.location !== providerLocation) {
      setIsLocationModalOpen(true);
    } else {
      processAccept();
    }
  };

  const processAccept = async () => {
    if (isAccepting) return;
    setIsAccepting(true);

    try {
      const result = await acceptJob(jobId);
      if (result.success) {
        toast.success('Job accepted successfully!');
        navigate('/provider/my-jobs');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to accept job';
      setActionError({
          isOpen: true,
          title: errorMessage.toLowerCase().includes('overlap') ? 'Schedule Conflict' : 'Action Failed',
          message: errorMessage
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleMessage = () => {
    if (job) {
      navigate(`/provider/messages?userId=${job.clientId}&name=${encodeURIComponent(job.clientName)}`);
    }
  };

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', backgroundColor: '#f8fafc' }}>
        <div className="text-center p-5 bg-white rounded-5 shadow-sm border border-f1f5f9" style={{ maxWidth: 480 }}>
          <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80, borderRadius: 24, background: '#fef2f2', color: '#ef4444' }}>
            <RiErrorWarningLine size={42} />
          </div>
          <h3 className="fw-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#0f172a' }}>Job Not Found</h3>
          <p className="text-muted mb-4" style={{ fontSize: '15px', lineHeight: 1.6 }}>{error || "The job you're looking for doesn't exist, has been removed, or you don't have permission to view it."}</p>
          <button
            className="btn btn-primary px-4 py-2-5 rounded-3 fw-bold w-100 shadow-sm"
            onClick={handleBack}
          >
            <RiArrowLeftLine className="me-2" /> Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isNew = job.createdAt ? (new Date().getTime() - new Date(job.createdAt).getTime()) < 24 * 60 * 60 * 1000 : false;

  return (
    <div className="py-4 px-3 px-lg-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <button
        className="btn btn-link text-decoration-none mb-4 p-0 d-flex align-items-center gap-2 transition-all hover-translate-x"
        onClick={handleBack}
        style={{ color: '#64748b', fontSize: '14px', fontWeight: 600 }}
      >
        <RiArrowLeftLine size={18} />
        <span>Back to Job Marketplace</span>
      </button>

      <div className="row g-5">
        <div className="col-12 col-xl-8">
          <JobDetailHeader
            title={job.title}
            location={job.location}
            postedAt={job.postedAt}
            isUrgent={job.isUrgent}
            isNew={isNew}
          />

          {/* Quick Stats Grid */}
          <div className="d-flex flex-wrap gap-3 mb-5">
            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded-3 border border-f1f5f9 shadow-sm">
              <RiUserAddLine className="text-primary" size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{job.freelancersNeeded || 1} Openings</span>
            </div>
            <div className="d-flex align-items-center gap-2 px-3 py-2 bg-white rounded-3 border border-f1f5f9 shadow-sm">
              <RiGroupLine className="text-success" size={18} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{job.applicants} Applicants</span>
            </div>
          </div>

          <JobInfoCard
            description={job.description}
            client={{
              name: job.clientName,
              initials: job.clientInitials,
              rating: job.clientRating,
              reviewsCount: job.clientReviewsCount,
              isVerified: job.isClientVerified,
              avatarUrl: job.clientAvatarUrl
            }}
            skills={job.skills}
          />
        </div>

        <div className="col-12 col-xl-4">
          <JobActionPanel
            budget={job.budget}
            duration={job.durationType.replace('_', ' ')}
            location={job.location}
            startDate={job.startDate}
            isApplied={job.isApplied || !!job.myApplication}
            isAssigned={job.status === 'fully_assigned'}
            onAccept={handleAccept}
            onMessage={handleMessage}
          />
        </div>
      </div>

      {job && (
        <UniversalActionModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onConfirm={processAccept}
          title="Location Mismatch"
          message="This opportunity is located outside your default work zone. Please confirm you can accommodate the travel requirements."
          iconType="location"
        >
          <div className="row g-3">
              <div className="col-6">
                  <div className="p-3 bg-light rounded-4 border">
                      <div className="d-flex align-items-center gap-2 mb-2 text-muted small fw-bold text-uppercase">
                          <RiMapPinUserLine size={14} />
                          Your Zone
                      </div>
                      <div className="fw-bold text-dark small">{providerLocation || 'Not Set'}</div>
                  </div>
              </div>
              <div className="col-6">
                  <div className="p-3 bg-primary-subtle rounded-4 border border-primary-subtle">
                      <div className="d-flex align-items-center gap-2 mb-2 text-primary small fw-bold text-uppercase">
                          <RiMapPinRangeLine size={14} />
                          Job Zone
                      </div>
                      <div className="fw-bold text-primary small">{job.location}</div>
                  </div>
              </div>
          </div>
        </UniversalActionModal>
      )}

      <ActionErrorModal
        isOpen={actionError.isOpen}
        onClose={() => setActionError(prev => ({ ...prev, isOpen: false }))}
        title={actionError.title}
        message={actionError.message}
        primaryAction={actionError.title === 'Schedule Conflict' ? {
            label: 'View My Schedule',
            onClick: () => navigate('/provider/my-jobs')
        } : undefined}
      />

      <VerificationPendingModal 
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
      />

      <style>{`
        .transition-all { transition: all 0.2s ease; }
        .hover-translate-x:hover { transform: translateX(-4px); color: #0f172a !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .row.g-5 { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

const JobDetailSkeleton: React.FC = () => (
  <div className="py-4 px-3 px-lg-5" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
    <div className="bg-slate-200 animate-pulse mb-4" style={{ width: 150, height: 20, borderRadius: 8 }}></div>
    <div className="row g-5">
      <div className="col-12 col-xl-8">
        <div className="d-flex gap-2 mb-3">
          <div className="bg-slate-200 animate-pulse" style={{ width: 100, height: 32, borderRadius: 8 }}></div>
          <div className="bg-slate-200 animate-pulse" style={{ width: 100, height: 32, borderRadius: 8 }}></div>
        </div>
        <div className="bg-slate-200 animate-pulse mb-4" style={{ width: '80%', height: 48, borderRadius: 12 }}></div>
        <div className="bg-slate-200 animate-pulse mb-5" style={{ width: '40%', height: 24, borderRadius: 8 }}></div>
        <div className="bg-slate-200 animate-pulse mb-4" style={{ height: 500, borderRadius: 24 }}></div>
      </div>
      <div className="col-12 col-xl-4">
        <div className="bg-slate-200 animate-pulse" style={{ height: 480, borderRadius: 24 }}></div>
      </div>
    </div>
    <style>{`
      .bg-slate-200 { background-color: #e2e8f0; }
      .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
    `}</style>
  </div>
);

export default JobDetailPage; 