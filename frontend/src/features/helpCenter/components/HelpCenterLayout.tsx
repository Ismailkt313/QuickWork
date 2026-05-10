import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  RiHome4Line, 
  RiUserSearchLine, 
  RiBriefcaseLine, 
  RiWallet3Line, 
  RiShieldCheckLine, 
  RiQuestionLine,
  RiArrowLeftLine
} from "react-icons/ri";
import "../helpCenter.css";

const HelpSidebarNavigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const groups = [
    {
      label: "Overview",
      links: [
        { path: "/help-center", label: "Help Home", icon: <RiHome4Line /> },
        { path: "/help-center/getting-started", label: "Getting Started", icon: <RiQuestionLine /> },
      ]
    },
    {
      label: "User Guides",
      links: [
        { path: "/help-center/client-guide", label: "For Clients", icon: <RiUserSearchLine /> },
        { path: "/help-center/provider-guide", label: "For Providers", icon: <RiBriefcaseLine /> },
      ]
    },
    {
      label: "Safety & Payments",
      links: [
        { path: "/help-center/payments", label: "Payments & Wallet", icon: <RiWallet3Line /> },
        { path: "/help-center/safety", label: "Trust & Safety", icon: <RiShieldCheckLine /> },
      ]
    },
    {
      label: "Resources",
      links: [
        { path: "/help-center/faq", label: "Common FAQs", icon: <RiQuestionLine /> },
      ]
    }
  ];

  return (
    <nav className="hc-sidebar-nav">
      <Link to="/" className="hc-nav-link" style={{ marginBottom: '2rem', color: 'var(--hc-primary)', fontWeight: 700 }}>
        <RiArrowLeftLine /> Back to QuickWork
      </Link>
      {groups.map(group => (
        <div key={group.label} className="hc-nav-group">
          <span className="hc-nav-label">{group.label}</span>
          {group.links.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`hc-nav-link ${isActive(link.path) ? 'active' : ''}`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
};

export const HelpCenterLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="hc-root">
      <div className="hc-container">
        <div className="hc-content-grid">
          <aside>
            <HelpSidebarNavigation />
          </aside>
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
