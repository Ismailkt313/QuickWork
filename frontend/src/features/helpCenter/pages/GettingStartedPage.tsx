import React from "react";
import { HelpCenterLayout } from "../components/HelpCenterLayout";
import { 
  RiRocketLine, 
  RiCheckboxCircleLine
} from "react-icons/ri";

const GettingStartedPage: React.FC = () => {
  return (
    <HelpCenterLayout>
      <div className="hc-article-header">
        <h1 className="hc-article-title">Getting Started with QuickWork</h1>
        <p className="hc-article-meta">Updated today • 4 min read</p>
      </div>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiRocketLine /> Welcome to the Community!</h2>
        <p className="hc-category-desc" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          QuickWork is a modern platform that connects busy individuals with local professionals for any task—big or small.
        </p>
        
        <div className="hc-step-card" style={{ marginBottom: '1.5rem' }}>
          <div className="hc-step-content">
            <h4>Step 1: Create Your Account</h4>
            <p>Sign up using your email. Whether you want to hire or provide services, one account does it all.</p>
          </div>
        </div>

        <div className="hc-step-card" style={{ marginBottom: '1.5rem' }}>
          <div className="hc-step-content">
            <h4>Step 2: Complete Your Profile</h4>
            <p>Add a photo and a brief bio. Verified profiles receive 3x more interaction from other community members.</p>
          </div>
        </div>

        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Step 3: Choose Your Path</h4>
            <p><strong>Looking to hire?</strong> Head to the Marketplace to find services.</p>
            <p><strong>Looking to work?</strong> Head to your profile settings to 'Become a Provider'.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiCheckboxCircleLine /> Quick Success Tips</h2>
        <div className="hc-card-grid">
          <div className="hc-step-card">
            <div className="hc-step-content">
              <h4>For Clients</h4>
              <p>Be specific in your job descriptions to attract the best experts.</p>
            </div>
          </div>
          <div className="hc-step-card">
            <div className="hc-step-content">
              <h4>For Providers</h4>
              <p>Keep your availability updated to receive relevant invitations.</p>
            </div>
          </div>
        </div>
      </section>
    </HelpCenterLayout>
  );
};

export default GettingStartedPage;
