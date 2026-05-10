import React from "react";
import { HelpCenterLayout } from "../components/HelpCenterLayout";
import { 
  RiWallet3Line, 
  RiHistoryLine, 
  RiSecurePaymentLine,
  RiRefundLine
} from "react-icons/ri";

const PaymentsHelpPage: React.FC = () => {
  return (
    <HelpCenterLayout>
      <div className="hc-article-header">
        <h1 className="hc-article-title">Payments & Your Wallet</h1>
        <p className="hc-article-meta">Updated 3 days ago • 5 min read</p>
      </div>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiWallet3Line /> How the Wallet Works</h2>
        <p className="hc-category-desc" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Your QuickWork Wallet is your secure center for all financial activities on the platform.
        </p>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>For Clients</h4>
            <p>You can add funds to your wallet using secure payment methods. When you hire a professional, the funds for that job are reserved in your wallet.</p>
          </div>
        </div>
        <div className="hc-step-card" style={{ marginTop: '1rem' }}>
          <div className="hc-step-content">
            <h4>For Providers</h4>
            <p>Your earnings are deposited into your wallet once a client approves a completed job. You can then request a withdrawal to your bank account.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiSecurePaymentLine /> Secure Milestone Payments</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Protection for Both Sides</h4>
            <p>QuickWork uses a "Milestone Guarantee" system. This means:</p>
            <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
              <li>The professional knows the budget is secured before they start work.</li>
              <li>The client knows they only release the payment once they are happy with the result.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiHistoryLine /> Transaction History</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>Clear Financial Records</h4>
            <p>Every payment, refund, and withdrawal is recorded in your Payment History. You can view receipts and track your total spending or earnings at any time.</p>
          </div>
        </div>
      </section>

      <section className="hc-section">
        <h2 className="hc-section-title"><RiRefundLine /> Refunds & Cancellations</h2>
        <div className="hc-step-card">
          <div className="hc-step-content">
            <h4>What happens if a job is cancelled?</h4>
            <p>If a job is cancelled before it starts, the reserved funds are returned to the client's wallet immediately. If a job is cancelled after work has begun, our support team can help mediate any partial payments based on the work completed.</p>
          </div>
        </div>
      </section>
    </HelpCenterLayout>
  );
};

export default PaymentsHelpPage;
