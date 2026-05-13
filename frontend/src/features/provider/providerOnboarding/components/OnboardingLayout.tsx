import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import WelcomeStep from "./steps/WelcomeStep";
import IdentityStep from "./steps/IdentityStep";
import SkillsStep from "./steps/SkillsStep";
import PortfolioStep from "./steps/PortfolioStep";
import ReviewStep from "./steps/ReviewStep";
import { useNavigate } from "react-router-dom";

const OnboardingLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep } = useSelector(
    (state: RootState) => state.onboarding
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <WelcomeStep />;
      case 1: return <IdentityStep />;
      case 2: return <SkillsStep />;
      case 3: return <PortfolioStep />;
      case 4: return <ReviewStep />;
      default: return <WelcomeStep />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* ── Sticky Nav ── */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#2563eb", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 16,
              boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
            }}>Q</div>
            <span style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Quick<span style={{ color: "#2563eb" }}>Work</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {currentStep > 0 && (
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                Step {currentStep} of 4
              </span>
            )}
            <button style={{
              padding: "8px 18px", borderRadius: 10,
              border: "1.5px solid #e2e8f0", background: "white",
              color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }} onClick={()=>navigate(`/help-center`)}>
              Get Help
            </button>
          </div>
        </div>
      </nav>

      {/* ── Step Content ── */}
      <main key={currentStep} style={{ animation: "obFadeUp 0.4s ease" }}>
        {renderStep()}
      </main>

      <style>{`
        @keyframes obFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingLayout;
