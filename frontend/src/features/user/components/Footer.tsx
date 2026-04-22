import React from "react";

const FOOTER_LINKS = {
  Services: [
    "Home Cleaning",
    "Plumbing",
    "Electrical",
    "Painting",
    "Carpentry",
  ],
  Company: ["About Us", "Careers", "Press", "Blog"],
  Support: ["Help Center", "Safety", "Terms of Service", "Privacy Policy"],
};

const SOCIALS = [
  { label: "Twitter / X", icon: "𝕏", href: "#" },
  { label: "Instagram", icon: "📸", href: "#" },
  { label: "LinkedIn", icon: "💼", href: "#" },
  { label: "YouTube", icon: "▶", href: "#" },
];

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#94a3b8",
        paddingTop: 56,
        paddingBottom: 32,
      }}
    >
      <div className="container">
        <div
          className="row g-5 pb-5"
          style={{ borderBottom: "1px solid #1e293b" }}
        >
          <div className="col-12 col-md-4">
            <a
              href="/"
              className="d-flex align-items-center gap-2 text-decoration-none mb-3"
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                Q
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: "#f1f5f9",
                  letterSpacing: "-0.02em",
                }}
              >
                Quick<span style={{ color: "#3b82f6" }}>Work</span>
              </span>
            </a>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                maxWidth: 280,
                color: "#64748b",
              }}
            >
              Connecting people with trusted, local service professionals for
              every home and business need.
            </p>
            <div className="d-flex gap-2 mt-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: "#1e293b",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "#3b82f6";
                    (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "#1e293b";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "#94a3b8";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div className="col-6 col-md-auto ms-md-auto" key={heading}>
              <h6
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#e2e8f0",
                  marginBottom: 16,
                }}
              >
                {heading}
              </h6>
              <ul className="list-unstyled mb-0">
                {links.map((link) => (
                  <li key={link} className="mb-2">
                    <a
                      href="#"
                      style={{
                        fontSize: 14,
                        color: "#64748b",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "#cbd5e1";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "#64748b";
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-4">
          <span style={{ fontSize: 13, color: "#475569" }}>
            © 2026 QuickWork Inc. All rights reserved.
          </span>
          <div className="d-flex gap-4">
            {["Privacy Policy", "Terms", "Cookie Settings"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: 13,
                  color: "#475569",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#94a3b8";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "#475569";
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
