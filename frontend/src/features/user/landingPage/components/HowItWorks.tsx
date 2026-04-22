import React from "react";

const STEPS = [
  {
    icon: "🔍",
    title: "Search",
    desc: "Browse hundreds of vetted service categories and filter by your location.",
  },
  {
    icon: "📊",
    title: "Compare",
    desc: "Review profiles, ratings, and hourly rates side by side to find the best fit.",
  },
  {
    icon: "🤝",
    title: "Hire",
    desc: "Book your professional in seconds and track the job from start to finish.",
  },
];

const HowItWorks: React.FC = () => (
  <section id="how-it-works" style={{ background: "#fff", padding: "72px 0" }}>
    <div className="container">
      <div className="text-center mb-5">
        <span
          style={{
            display: "inline-block",
            background: "#eff6ff",
            color: "#3b82f6",
            borderRadius: 20,
            padding: "5px 16px",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginBottom: 12,
            textTransform: "uppercase",
          }}
        >
          How it Works
        </span>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Get help in 3 simple steps
        </h2>
      </div>

      <div className="row g-4">
        {STEPS.map((step, i) => (
          <div className="col-md-4" key={step.title}>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 16,
                padding: "36px 28px",
                border: "1.5px solid #f1f5f9",
                height: "100%",
                transition: "all 0.2s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#fff";
                el.style.boxShadow = "0 8px 28px rgba(59,130,246,0.1)";
                el.style.borderColor = "#bfdbfe";
                el.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "#f8fafc";
                el.style.boxShadow = "none";
                el.style.borderColor = "#f1f5f9";
                el.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#cbd5e1",
                  letterSpacing: "0.05em",
                }}
              >
                0{i + 1}
              </div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  marginBottom: 20,
                }}
              >
                {step.icon}
              </div>
              <h5
                style={{
                  fontWeight: 700,
                  fontSize: 17,
                  color: "#0f172a",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </h5>
              <p
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
