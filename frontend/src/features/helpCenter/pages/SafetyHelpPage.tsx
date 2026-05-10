import React from "react";
import { HelpCenterLayout } from "../components/HelpCenterLayout";
import { 
  RiShieldCheckLine, 
  RiUserVoiceLine, 
  RiLockLine, 
  RiErrorWarningLine
} from "react-icons/ri";

const SafetyHelpPage: React.FC = () => {
  return (
    <HelpCenterLayout>
      <div className="hc-article-header">
        <h1 className="hc-article-title">Trust & Safety</h1>
        <p className="hc-article-meta">Updated 5 days ago • 4 min read</p>
      </div>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiShieldCheckLine /> Our Commitment to Safety</h2>
        <p className="hc-category-desc" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          At QuickWork, your safety and peace of mind are our top priorities. We use a combination of verification, technology, and community moderation to protect all users.
        </p>
        <div className="hc-card-grid">
          <div className="hc-step-card">
            <div className="hc-step-content">
              <h4>Verified Profiles</h4>
              <p>We verify the identity of every service professional on the platform to ensure authenticity.</p>
            </div>
          </div>
          <div className="hc-step-card">
            <div className="hc-step-content">
              <h4>Secure Communication</h4>
              <p>All messaging and payment activities are encrypted and monitored for suspicious behavior.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiLockLine /> Protecting Your Privacy</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Data Security</h4>
            <p>Your personal information (like your email or phone number) is never shared with other users without your consent. We recommend using our integrated messaging system for all project discussions.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiUserVoiceLine /> The Power of Reviews</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Community Vetting</h4>
            <p>The best way to stay safe is to check reviews. Real feedback from previous clients gives you a transparent view of a professional's reliability and quality of work.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiErrorWarningLine /> Reporting an Issue</h2>
        <div className="hc-step-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="hc-step-content">
            <h4>Need Immediate Help?</h4>
            <p>If you encounter any behavior that violates our community standards, you can 'Report' the user directly from their profile or a job page. Our moderation team reviews every report within 24 hours.</p>
          </div>
        </div>
      </section>
    </HelpCenterLayout>
  );
};

export default SafetyHelpPage;
