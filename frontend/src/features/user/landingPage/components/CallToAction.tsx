import React from "react";
import { useNavigate } from "react-router-dom";

const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section
      style={{
        background: "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
        padding: "72px 0",
      }}
    >
      <div className="container text-center">
        <span
          style={{
            display: "inline-block",
            background: "rgba(59,130,246,.18)",
            color: "#93c5fd",
            borderRadius: 20,
            padding: "5px 16px",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "0.06em",
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          Get Started Today
        </span>
        <h2
          style={{
            fontSize: "clamp(1.6rem,4vw,2.5rem)",
            fontWeight: 800,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Find trusted professionals near you
        </h2>
        <p
          style={{
            fontSize: 16,
            color: "#94a3b8",
            maxWidth: 480,
            margin: "0 auto 36px",
          }}
        >
          Join thousands of satisfied customers who book quality professionals
          every day on QuickWork.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button
            onClick={() => navigate("/user/services")}
            style={{
              padding: "14px 36px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(37,99,235,.45)",
              transition: "all .2s",
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
            Browse Services →
          </button>
          <button
            onClick={() => navigate("/provider/become-provider")}
            style={{
              padding: "14px 36px",
              borderRadius: 12,
              border: "1.5px solid rgba(255,255,255,.15)",
              background: "rgba(255,255,255,.06)",
              color: "#e2e8f0",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,.06)";
            }}
          >
            Become a provider
          </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
