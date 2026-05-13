import React from "react";
import { useDispatch } from "react-redux";
import { setCurrentStep } from "../../../providerOnboarding/store/onboardingSlice";
import { RiVerifiedBadgeFill, RiMegaphoneFill, RiMoneyDollarCircleFill, RiArrowRightLine, RiTimeLine } from "react-icons/ri";

const features = [
  {
    icon: RiVerifiedBadgeFill,
    color: "#2563eb",
    bg: "#eff6ff",
    title: "Verified Badge",
    desc: "Build instant trust with a verified professional identity.",
  },
  {
    icon: RiMegaphoneFill,
    color: "#059669",
    bg: "#f0fdf4",
    title: "Direct Leads",
    desc: "Receive genuine client opportunities without bidding wars.",
  },
  {
    icon: RiMoneyDollarCircleFill,
    color: "#d97706",
    bg: "#fffbeb",
    title: "Flexible Earnings",
    desc: "Set your own rates and keep full control of your income.",
  },
];

const WelcomeStep: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", background: "#f8fafc", padding: "48px 16px 80px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "0 0 20px",
          }}>
            Build Your<br />
            <span style={{ color: "#2563eb" }}>Professional Profile</span>
          </h1>
          <p style={{ fontSize: "1.0625rem", color: "#64748b", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Join verified professionals and start receiving trusted client requests through QuickWork's premium onboarding.
          </p>
        </div>

        {/* Feature cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 52,
        }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{
                background: "white",
                border: "1.5px solid #e2e8f0",
                borderRadius: 20,
                padding: "32px 24px",
                textAlign: "center",
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 16,
                  background: f.bg, color: f.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <Icon size={28} />
                </div>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#0f172a", margin: "0 0 10px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "#94a3b8", fontSize: "0.8125rem", fontWeight: 600,
            marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            <RiTimeLine size={14} /> Takes 5–7 minutes
          </div>
          <br />
          <button
            onClick={() => dispatch(setCurrentStep(1))}
            className="ob-btn-primary"
            style={{ minWidth: 220, fontSize: "1rem" }}
          >
            Start Application <RiArrowRightLine size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;