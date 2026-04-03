import React from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './style/VerificationStatus.css';

interface VerificationStatusProps {
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  onRefresh?: () => void;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ status, rejectionReason, onRefresh }) => {
  const navigate = useNavigate();

  const renderContent = () => {
    switch (status) {
      case 'verified':
        return (
          <div className="vs-root verified">
            <div className="vs-content">
              <div className="vs-icon-box">
                <FiCheckCircle />
              </div>
              <div className="vs-text-group">
                <h3 className="vs-title">Account Verified</h3>
                <p className="vs-desc">
                  Congratulations! Your profile is verified. You can now accept all public jobs and direct offers.
                </p>
              </div>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="vs-root pending">
            <div className="vs-content">
              <div className="vs-icon-box">
                <FiClock />
              </div>
              <div className="vs-text-group">
                <h3 className="vs-title">Verification Under Review</h3>
                <p className="vs-desc">
                  Our team is currently reviewing your documents. This usually takes 24-48 hours. We'll notify you once it's complete.
                </p>
              </div>
              <button className="vs-action-btn" onClick={onRefresh} style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                Check Update
              </button>
            </div>
          </div>
        );

      case 'rejected':
        return (
          <div className="vs-root rejected">
            <div className="vs-content">
              <div className="vs-icon-box">
                <FiAlertCircle />
              </div>
              <div className="vs-text-group">
                <h3 className="vs-title">Application Rejected</h3>
                <p className="vs-desc">
                  Unfortunately, your verification was not successful. Please review the reason below and update your profile.
                </p>
                {rejectionReason && (
                  <div className="vs-rejection-msg">
                    <span className="vs-rejection-label">Reason for Rejection:</span>
                    {rejectionReason}
                  </div>
                )}
              </div>
              <button className="vs-action-btn rejected" onClick={() => navigate('/provider/profile')}>
                Update Profile <FiChevronRight />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderContent();
};

export default VerificationStatus;
