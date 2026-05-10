import React from "react";
import { HelpCenterLayout } from "../components/HelpCenterLayout";
import { 
  RiSearchLine, 
  RiMessage3Line, 
  RiWallet3Line, 
  RiStarLine,
  RiCheckDoubleLine
} from "react-icons/ri";

const ClientGuidePage: React.FC = () => {
  return (
    <HelpCenterLayout>
      <div className="hc-article-header">
        <h1 className="hc-article-title">Complete Client Guide</h1>
        <p className="hc-article-meta">Updated 2 days ago • 6 min read</p>
      </div>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiSearchLine /> Finding the Right Professional</h2>
        <p className="hc-category-desc" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Finding help on QuickWork is designed to be fast and secure. You have two main ways to connect with experts:
        </p>
        <div className="hc-card-grid">
          <div className="hc-step-card">
            <div className="hc-step-number">1</div>
            <div className="hc-step-content">
              <h4>Browse the Marketplace</h4>
              <p>Explore categories like Plumbing, Web Design, or Cleaning. View profiles, portfolios, and reviews.</p>
            </div>
          </div>
          <div className="hc-step-card">
            <div className="hc-step-number">2</div>
            <div className="hc-step-content">
              <h4>Post a Job Request</h4>
              <p>Describe your task, set your budget, and let qualified professionals apply directly to you.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiMessage3Line /> Communication & Hiring</h2>
        <div className="hc-step-card" style={{ marginBottom: '1rem' }}>
          <div className="hc-step-content">
            <h4>Start a Conversation</h4>
            <p>Use the 'Message' button on any profile to discuss your project. We recommend keeping all communication within QuickWork for your safety.</p>
          </div>
        </div>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Sending an Invitation</h4>
            <p>Once you've found the right fit, click 'Hire' or 'Invite'. The professional will review your invitation and confirm the details.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiWallet3Line /> Payments & Safety</h2>
        <p className="hc-category-desc" style={{ marginBottom: '1.5rem' }}>
          QuickWork uses a milestone-based payment system to protect both you and the professional.
        </p>
        <div className="hc-step-card">
          <div className="hc-step-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <RiCheckDoubleLine color="var(--hc-primary)" size={20} />
              <span><strong>Secured Funds:</strong> When a job starts, the funds are held securely by the platform.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <RiCheckDoubleLine color="var(--hc-primary)" size={20} />
              <span><strong>Release on Success:</strong> Funds are only released to the professional once you confirm completion.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <RiCheckDoubleLine color="var(--hc-primary)" size={20} />
              <span><strong>Transparent History:</strong> View every transaction and receipt in your Wallet.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiStarLine /> Reviews & Reputation</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Build a Trusted Community</h4>
            <p>After every job, you can leave a review for the professional. Your honest feedback helps other clients make informed decisions and rewards excellent work.</p>
          </div>
        </div>
      </section>
    </HelpCenterLayout>
  );
};

export default ClientGuidePage;
