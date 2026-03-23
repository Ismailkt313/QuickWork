import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import StepIndicator from "./StepIndicator";
import WelcomeStep from "./steps/WelcomeStep";
import IdentityStep from "./steps/IdentityStep";
import SkillsStep from "./steps/SkillsStep";
import PortfolioStep from "./steps/PortfolioStep";
import ReviewStep from "./steps/ReviewStep";
import {  useNavigate } from "react-router-dom";

const OnboardingLayout: React.FC = () => {
    const navigate = useNavigate();
    const { currentStep } = useSelector((state: RootState) => state.onboarding);
    const totalSteps = 5;

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <WelcomeStep />;
            case 1:
                return <IdentityStep />;
            case 2:
                return <SkillsStep />;
            case 3:
                return <PortfolioStep />;
            case 4:
                return <ReviewStep />;
            default:
                return (
                    <div className="text-center py-5">
                        <h3 className="text-muted">Coming Soon: Step {currentStep}</h3>
                        <button
                            onClick={() => alert("Registration logic will be added in Phase 2")}
                            className="btn btn-outline-primary mt-3"
                        >
                            Finish Integration
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="onboarding-system min-vh-100 bg-white">
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3">
                <div className="container" style={{ maxWidth: 1100 }}>
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="d-flex align-items-center justify-content-center rounded-3"
                            style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                        >
                            <span className="text-white fw-bold" style={{ fontSize: 15 }}>Q</span>
                        </div>
                        <span className="fw-bold fs-5 tracking-tight" onClick={() => navigate("/")}>QuickWork</span>
                    </div>
                    <div className="ms-auto">
                        <span className="text-muted small d-none d-md-inline me-3">Need help?</span>
                        <button className="btn btn-outline-secondary btn-sm rounded-pill px-3">Support</button>
                    </div>
                </div>
            </nav>

            <div className="main-content slide-up">
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
                {renderStep()}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .slide-up {
          animation: slideUp 0.6s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .transition-all {
          transition: all 0.3s ease;
        }
        .bg-light {
          background-color: #f8f9fa !important;
        }
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          background-color: #fff !important;
        }
      `}} />
        </div>
    );
};

export default OnboardingLayout;
