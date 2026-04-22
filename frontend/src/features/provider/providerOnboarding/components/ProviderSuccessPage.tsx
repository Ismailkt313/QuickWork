import React from "react";
import { useNavigate } from "react-router-dom";

const ProviderSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
      <div
        className="card shadow-lg border-0 rounded-4 p-5 text-center"
        style={{ maxWidth: "600px", width: "90%" }}
      >
        <div className="mb-4">
          <div
            className="rounded-circle bg-success bg-opacity-10 d-flex justify-content-center align-items-center mx-auto"
            style={{ width: "100px", height: "100px" }}
          >
            <i
              className="bi bi-check-circle-fill text-success"
              style={{ fontSize: "3rem" }}
            ></i>
          </div>
        </div>
        <h2 className="fw-bold mb-3">Application Submitted Successfully!</h2>
        <p className="text-secondary mb-4 fs-5">
          Welcome aboard! Your service provider application is under review by
          our admin team. You will be notified via email once your profile is
          approved and live on the platform.
        </p>
        <div className="card bg-light border p-4 rounded-3 text-start mb-4">
          <h5 className="fw-bold fs-6 mb-3">What happens next?</h5>
          <ul
            className="text-secondary mb-0 p-0"
            style={{ listStyleType: "none" }}
          >
            <li className="mb-2">
              <i className="bi bi-clock-history text-primary me-2"></i> Our team
              will review your credentials within 24-48 hours.
            </li>
            <li className="mb-2">
              <i className="bi bi-shield-check text-primary me-2"></i>{" "}
              Background checks and identity verification will be conducted.
            </li>
            <li>
              <i className="bi bi-envelope-check text-primary me-2"></i> Look
              out for an approval email with your dashboard access link.
            </li>
          </ul>
        </div>
        <button
          onClick={() => navigate("/provider/dashboard")}
          className="btn btn-primary px-5 py-3 fw-bold rounded-pill w-100 shadow"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};

export default ProviderSuccessPage;
