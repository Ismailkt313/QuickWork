import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e293b 100%)",
        padding: "80px 0 72px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container position-relative">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#93c5fd",
                borderRadius: 20,
                padding: "5px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                marginBottom: 24,
                letterSpacing: "0.03em",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#60a5fa",
                  display: "inline-block",
                }}
              />
              100% Verified Professionals
            </span>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                color: "#f1f5f9",
                lineHeight: 1.2,
                letterSpacing: "-0.03em",
                marginBottom: 20,
              }}
            >
              Find trusted home{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                service pros
              </span>
              , fast
            </h1>

            <p
              style={{
                fontSize: 17,
                color: "#94a3b8",
                lineHeight: 1.7,
                marginBottom: 36,
                maxWidth: 440,
              }}
            >
              Connect with vetted freelancers for plumbing, cleaning, electrical
              work, and 200+ other services — in your neighbourhood.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/user/services")}
                style={{
                  padding: "14px 32px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(0)";
                }}
              >
                Find Services →
              </button>
              <button
                onClick={() => navigate("/provider/dashboard")}
                style={{
                  padding: "14px 32px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  backdropFilter: "blur(6px)",
                  color: "#e2e8f0",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.06)";
                }}
              >
                Become a Provider
              </button>
            </div>

            <div className="d-flex flex-wrap gap-4 mt-5">
              {[
                ["50K+", "Happy Clients"],
                ["5K+", "Verified Pros"],
                ["200+", "Services"],
                ["4.9★", "Rating"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div
                    style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}
                  >
                    {num}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6 d-none d-lg-block">
            <div style={{ position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=640&q=80"
                alt="Service professional at work"
                style={{
                  width: "100%",
                  borderRadius: 20,
                  boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: -24,
                  background: "#fff",
                  borderRadius: 14,
                  padding: "12px 18px",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  ✅
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}
                  >
                    Job Completed
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    2 minutes ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
