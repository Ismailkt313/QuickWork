import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RiArrowLeftLine, RiErrorWarningLine } from 'react-icons/ri';
import { useJobDetails } from '../hooks/useJobDetails';
import JobDetailHeader from '../components/JobDetailHeader';
import JobInfoCard from '../components/JobInfoCard';
import JobActionPanel from '../components/JobActionPanel';
import { toast } from 'react-toastify';

const JobDetailPage: React.FC = () => {
  const { jobId } = useParams() as { jobId: string };
  const navigate = useNavigate();
  const { job, loading, error } = useJobDetails(jobId);

  const handleBack = () => {
    navigate('/provider/available-jobs');
  };

  const handleAccept = () => {
    toast.success('Interest sent to client successfully!');
  };

  const handleMessage = () => {
    navigate(`/provider/messages?clientId=${job?.clientName}`);
  };

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="ajp-root d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <RiErrorWarningLine size={48} className="text-danger mb-3" />
          <h3 className="fw-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Job Not Found</h3>
          <p className="mb-4" style={{ color: 'var(--qw-muted)' }}>{error || "The job you're looking for doesn't exist or has been removed."}</p>
          <button
            className="btn btn-primary px-4 py-2-5 rounded-3 fw-bold"
            onClick={handleBack}
            style={{ backgroundColor: 'var(--qw-accent)', border: 'none' }}
          >
            <RiArrowLeftLine className="me-2" /> Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const isNew = job.createdAt ? (new Date().getTime() - new Date(job.createdAt).getTime()) < 24 * 60 * 60 * 1000 : false;

  return (
    <div className="ajp-root py-4 px-3 px-lg-4 animate__animated animate__fadeIn">
      <button
        className="btn btn-link text-decoration-none mb-4 p-0 d-flex align-items-center gap-2 hover-translate-x"
        onClick={handleBack}
        style={{ transition: 'transform 0.2s ease', color: 'var(--qw-muted)' }}
      >
        <RiArrowLeftLine size={18} />
        <span className="fw-semibold" style={{ fontSize: '14px' }}>Back to Marketplace</span>
      </button>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <JobDetailHeader
            title={job.title}
            location={job.location}
            postedAt={job.postedAt}
            isUrgent={job.isUrgent}
            isNew={isNew}
          />

          {/* Job Details Grid — Patterned after ajp-stats-row */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            <div className="ajp-stat-pill" style={{ background: 'var(--qw-bg)', padding: '8px 16px' }}>
              <span className="me-2" style={{ color: 'var(--qw-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Expertise</span>
              <span className="ajp-stat-num">{job.experienceLevel || 'Intermediate'}</span>
            </div>
            <div className="ajp-stat-pill" style={{ background: 'var(--qw-bg)', padding: '8px 16px' }}>
              <span className="me-2" style={{ color: 'var(--qw-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Type</span>
              <span className="ajp-stat-num">{job.jobType}</span>
            </div>
            <div className="ajp-stat-pill" style={{ background: 'var(--qw-bg)', padding: '8px 16px' }}>
              <span className="me-2" style={{ color: 'var(--qw-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Openings</span>
              <span className="ajp-stat-num">{job.freelancersNeeded || 1}</span>
            </div>
            <div className="ajp-stat-pill" style={{ background: 'var(--qw-bg)', padding: '8px 16px' }}>
              <span className="me-2" style={{ color: 'var(--qw-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Applicants</span>
              <span className="ajp-stat-num">{job.applicants}</span>
            </div>
          </div>

          <JobInfoCard
            description={job.description}
            client={{
              name: job.clientName,
              initials: job.clientInitials,
              rating: job.clientRating,
              reviewsCount: job.clientReviewsCount,
              isVerified: job.isClientVerified
            }}
            skills={job.skills}
          />
        </div>

        <div className="col-12 col-lg-4">
          <div className="action-panel-container h-100">
            <JobActionPanel
              budget={job.budget}
              duration={job.durationType}
              location={job.location}
              startDate={job.startDate}
              isApplied={!!job.myApplication}
              isAssigned={job.status === 'assigned'}
              onAccept={handleAccept}
              onMessage={handleMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const JobDetailSkeleton: React.FC = () => (
  <div className="ajp-root py-4 px-3 px-lg-4">
    <div className="ajp-skel mb-4" style={{ width: 150, height: 24, borderRadius: 8 }}></div>
    <div className="row g-4">
      <div className="col-12 col-lg-8">
        <div className="ajp-skel mb-3" style={{ width: '30%', height: 28, borderRadius: 20 }}></div>
        <div className="ajp-skel mb-4" style={{ width: '70%', height: 48, borderRadius: 12 }}></div>
        <div className="d-flex gap-2 mb-4">
          {[120, 100, 90, 110].map((w, i) => (
            <div key={i} className="ajp-skel" style={{ width: w, height: 36, borderRadius: 30 }}></div>
          ))}
        </div>
        <div className="ajp-skel mb-4" style={{ height: 400, borderRadius: 16 }}></div>
      </div>
      <div className="col-12 col-lg-4">
        <div className="ajp-skel" style={{ height: 450, borderRadius: 16 }}></div>
      </div>
    </div>
  </div>
);

export default JobDetailPage;
