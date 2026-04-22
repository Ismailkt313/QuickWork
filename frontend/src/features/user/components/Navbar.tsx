import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  locationName?: string;
  onLocationClick?: () => void;
  onClearLocation?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ locationName, onLocationClick }) => {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  return (
    <nav className="navbar navbar-expand-lg qw-navbar sticky-top">
      <div className="container qw-container">
        <a className="navbar-brand qw-logo" href="/">
          <span className="qw-logo-icon">✦</span>
          QuickWork
        </a>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse${navOpen ? " show" : ""}`}>
          <ul className="navbar-nav mx-auto gap-lg-4 gap-2">
            {["Find Work", "Hire", "How it Works"].map((link) => (
              <li className="nav-item" key={link}>
                <a className="nav-link qw-nav-link" href="#">
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            <button
              onClick={onLocationClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 20,
                border: "1.5px solid #e2e8f0",
                background: locationName ? "#eff6ff" : "#fff",
                color: locationName ? "#1d4ed8" : "#64748b",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              <span>📍</span>
              <span>{locationName ?? "Choose Location"}</span>
            </button>

            {token ? (
              <button
                onClick={() => navigate("/become-provider")}
                className="btn qw-btn-primary px-4"
                style={{ fontSize: 13 }}
              >
                Become a Pro
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="btn qw-btn-primary px-4"
                style={{ fontSize: 13 }}
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
