import React from "react";
import { HelpCenterLayout } from "../components/HelpCenterLayout";
import { 
  RiShieldUserLine, 
  RiSearchLine, 
  RiCalendarEventLine, 
  RiWallet3Line, 
  RiStarLine,
  RiCheckboxCircleLine
} from "react-icons/ri";

const ProviderGuidePage: React.FC = () => {
  return (
    <HelpCenterLayout>
      <div className="hc-article-header">
        <h1 className="hc-article-title">Provider Operational Guide</h1>
        <p className="hc-article-meta">Updated 1 day ago • 8 min read</p>
      </div>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiShieldUserLine /> Verification & Onboarding</h2>
        <p className="hc-category-desc" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          To maintain a premium marketplace, all professionals must go through our verification process.
        </p>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>The Verification Path</h4>
            <p>1. Complete your profile with a clear photo and bio.</p>
            <p>2. Add your top skills and portfolio examples.</p>
            <p>3. Submit your identity documents for review.</p>
            <p style={{ marginTop: '0.5rem', color: 'var(--hc-primary)', fontWeight: 600 }}>Once verified, you will receive a verification badge and can start accepting jobs.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiSearchLine /> Finding Work</h2>
        <div className="hc-card-grid">
          <div className="hc-step-card">
            <div className="hc-step-content">
              <h4>Browse Open Jobs</h4>
              <p>Visit the 'Available Jobs' marketplace to see requests from clients. Filter by location and budget to find the best fit.</p>
            </div>
          </div>
          <div className="hc-step-card">
            <div className="hc-step-content">
              <h4>Direct Invitations</h4>
              <p>Clients who visit your profile can invite you directly. Respond quickly to improve your responsiveness rating.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiCalendarEventLine /> Managing Your Schedule</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Stay Organized</h4>
            <p>Your Provider Dashboard shows your current workload. Always keep your status updated—moving from 'Assigned' to 'In Progress' keeps your clients confident in your work.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiWallet3Line /> Earnings & Payments</h2>
        <div className="hc-step-card">
          <div className="hc-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <RiCheckboxCircleLine color="#16a34a" size={20} />
              <span><strong>Guaranteed Payment:</strong> Funds are secured by QuickWork before you start working.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <RiCheckboxCircleLine color="#16a34a" size={20} />
              <span><strong>Automatic Payouts:</strong> Once the client approves the completion, funds are added to your wallet.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <RiCheckboxCircleLine color="#16a34a" size={20} />
              <span><strong>Low Fees:</strong> We only take a small commission to keep the platform running and bring you more clients.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiStarLine /> Building Reputation</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Success Tips</h4>
            <p>Consistency is key. Great communication and high-quality work lead to 5-star reviews, which in turn place you higher in search results and attract more premium clients.</p>
          </div>
        </div>
      </section>
    </HelpCenterLayout>
  );
};

export default ProviderGuidePage;
