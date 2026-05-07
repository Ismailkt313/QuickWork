import React from "react";
import { useNavigate } from "react-router-dom";
import { RiCheckboxCircleFill, RiTimeLine, RiShieldCheckLine, RiMailSendLine, RiArrowRightLine } from "react-icons/ri";

const ProviderSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light py-5 px-3">
      {}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <div className="position-absolute rounded-circle bg-primary opacity-5" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px', filter: 'blur(80px)' }}></div>
        <div className="position-absolute rounded-circle bg-indigo opacity-5" style={{ width: '300px', height: '300px', bottom: '-50px', right: '-50px', filter: 'blur(60px)' }}></div>
      </div>

      <div
        className="card border-0 shadow-lg rounded-5 overflow-hidden animate__animated animate__fadeInUp"
        style={{ maxWidth: "580px", width: "100%", zIndex: 1 }}
      >
        <div className="bg-primary p-2"></div>

        <div className="card-body p-4 p-md-5 text-center">
          <div className="mb-4">
            <div
              className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center mx-auto animate__animated animate__bounceIn animate__delay-1s"
              style={{ width: "90px", height: "90px" }}
            >
              <RiCheckboxCircleFill className="text-success" size={56} />
            </div>
          </div>

          <h2 className="fw-800 text-dark mb-3">Application Submitted!</h2>
          <p className="text-secondary mb-5 px-md-3">
            Your professional application is now in the hands of our verification team.
            We'll review your details and get back to you shortly.
          </p>

          <div className="text-start bg-light rounded-4 p-4 mb-5 border border-white shadow-sm">
            <h5 className="fw-700 fs-6 mb-4 text-primary d-flex align-items-center gap-2">
              Next Steps
            </h5>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <RiTimeLine className="text-primary" size={18} />
                  </div>
                </div>
                <div>
                  <h6 className="fw-600 mb-0 small">Profile Review</h6>
                  <p className="text-muted smaller mb-0">Our team will verify your credentials within 24-48 hours.</p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <RiShieldCheckLine className="text-primary" size={18} />
                  </div>
                </div>
                <div>
                  <h6 className="fw-600 mb-0 small">Identity Verification</h6>
                  <p className="text-muted smaller mb-0">Background checks ensure platform safety for everyone.</p>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <RiMailSendLine className="text-primary" size={18} />
                  </div>
                </div>
                <div>
                  <h6 className="fw-600 mb-0 small">Email Notification</h6>
                  <p className="text-muted smaller mb-0">You'll receive an email once your dashboard is ready.</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="btn btn-primary btn-lg rounded-pill px-5 w-100 fw-700 shadow-sm d-flex align-items-center justify-content-center gap-2"
            style={{ height: '56px' }}
          >
            Go to Home
            <RiArrowRightLine />
          </button>
        </div>
      </div>

      <p className="text-muted mt-4 small fw-500">
        Need assistance? <span className="text-primary cursor-pointer">Contact Support</span>
      </p>

      <style>{`
        .fw-700 { font-weight: 700; }
        .fw-800 { font-weight: 800; }
        .fw-600 { font-weight: 600; }
        .smaller { font-size: 0.85rem; }
        .bg-indigo { background-color: #6366f1; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default ProviderSuccessPage;
