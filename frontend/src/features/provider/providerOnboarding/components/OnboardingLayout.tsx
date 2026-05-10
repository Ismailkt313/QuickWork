import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import StepIndicator from "./StepIndicator";
import WelcomeStep from "./steps/WelcomeStep";
import IdentityStep from "./steps/IdentityStep";
import SkillsStep from "./steps/SkillsStep";
import PortfolioStep from "./steps/PortfolioStep";
import ReviewStep from "./steps/ReviewStep";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
              onClick={() =>
                toast.info("Registration logic will be added in Phase 2")
              }
              className="btn btn-outline-primary mt-3"
            >
              Finish Integration
            </button>
          </div>
        );
    }
  };

  return (
    <div className="onboarding-system min-h-screen bg-slate-50">
      <nav className="w-full bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white font-black shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
              Q
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Quick<span className="text-blue-600">Work</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline text-xs font-bold text-slate-400 uppercase tracking-widest">
              Professional Integration
            </span>
            <button className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
              Get Help
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto py-10 px-4 slide-up">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .slide-up {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `,
        }}
      />
    </div>
  );
};

export default OnboardingLayout;
