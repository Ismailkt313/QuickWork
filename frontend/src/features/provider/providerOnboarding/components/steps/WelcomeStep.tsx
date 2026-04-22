import { useDispatch } from "react-redux";
import { setCurrentStep } from "../../../providerOnboarding/store/onboardingSlice";

const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch();

  const handleStart = () => {
    dispatch(setCurrentStep(1));
  };

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-3">Build Your Professional Profile</h1>
        <p className="text-secondary fs-5">
          Join verified professionals and start receiving trusted client
          requests.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 text-center">
            <div className="mb-3 text-primary">
              <i className="bi bi-patch-check-fill fs-1"></i>
            </div>
            <h5 className="fw-bold">Verified Badge</h5>
            <p className="text-secondary small mb-0">
              Get an exclusive badge that builds immediate trust with potential
              clients.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 text-center">
            <div className="mb-3 text-success">
              <i className="bi bi-megaphone-fill fs-1"></i>
            </div>
            <h5 className="fw-bold">Direct Client Leads</h5>
            <p className="text-secondary small mb-0">
              Receive high-quality leads directly in your inbox without any
              bidding wars.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 text-center">
            <div className="mb-3 text-warning">
              <i className="bi bi-cash-stack fs-1"></i>
            </div>
            <h5 className="fw-bold">Flexible Earnings</h5>
            <p className="text-secondary small mb-0">
              Set your own rates and keep 100% of what you earn with zero hidden
              fees.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-muted mb-4">
          <i className="bi bi-clock me-2"></i>
          Takes 5–7 minutes
        </p>
        <button
          onClick={handleStart}
          className="btn btn-primary btn-lg px-5 py-3 fw-bold rounded-pill shadow"
        >
          Start Application
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
