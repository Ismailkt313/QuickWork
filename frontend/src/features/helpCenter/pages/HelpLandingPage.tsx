import React from "react";
import { 
  RiUserSearchLine, 
  RiBriefcaseLine, 
  RiWallet3Line, 
  RiShieldCheckLine, 
  RiQuestionLine,
  RiMessage3Line,
  RiArrowRightLine
} from "react-icons/ri";
import { HelpHeroSection, HelpFAQAccordion, SupportContactCard } from "../components/HelpComponents";
import { Link } from "react-router-dom";
import "../helpCenter.css";

const HelpLandingPage: React.FC = () => {
  const categories = [
    {
      to: "/help-center/getting-started",
      icon: <RiQuestionLine />,
      title: "Getting Started",
      description: "New to QuickWork? Learn the basics and how to set up your account in minutes."
    },
    {
      to: "/help-center/client-guide",
      icon: <RiUserSearchLine />,
      title: "Hiring Professionals",
      description: "Learn how to find, message, and hire the best experts for your specific projects."
    },
    {
      to: "/help-center/provider-guide",
      icon: <RiBriefcaseLine />,
      title: "Becoming a Provider",
      description: "Everything you need to know about setting up your profile and growing your business."
    },
    {
      to: "/help-center/payments",
      icon: <RiWallet3Line />,
      title: "Payments & Wallet",
      description: "Understand how secure payments work, managing your wallet, and transaction history."
    },
    {
      to: "/help-center/safety",
      icon: <RiShieldCheckLine />,
      title: "Trust & Safety",
      description: "Our commitment to keeping you safe with verified profiles and secure collaborations."
    },
    {
      to: "/help-center/messaging",
      icon: <RiMessage3Line />,
      title: "Messaging & Reviews",
      description: "How to communicate effectively and build your reputation with honest reviews."
    }
  ];

  const topFAQs = [
    {
      question: "How does QuickWork ensure quality?",
      answer: "We verify every provider through a rigorous onboarding process, including identity checks and portfolio reviews. Our review system also ensures transparent feedback from real clients."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes. QuickWork uses a secure payment system where funds are held safely and only released once you confirm the job milestones have been met."
    },
    {
      question: "Can I cancel a job once it has started?",
      answer: "Yes, jobs can be cancelled through the 'My Jobs' dashboard. Depending on the stage of the job, our cancellation policy will determine any necessary refunds or partial payments."
    }
  ];

  return (
    <div className="hc-root">
      <HelpHeroSection />
      
      <div className="hc-container" style={{ paddingBottom: '5rem' }}>
        <div className="hc-categories">
          {categories.map((cat, i) => (
            <Link key={i} to={cat.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hc-category-card">
                <div className="hc-category-icon">{cat.icon}</div>
                <h3 className="hc-category-title">{cat.title}</h3>
                <p className="hc-category-desc">{cat.description}</p>
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--hc-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                  Learn More <RiArrowRightLine />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="hc-section" style={{ marginTop: '6rem' }}>
          <h2 className="hc-section-title">Top Frequently Asked Questions</h2>
          <HelpFAQAccordion items={topFAQs} />
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/help-center/faq" style={{ color: 'var(--hc-primary)', fontWeight: 700, textDecoration: 'none' }}>
              View all FAQs <RiArrowRightLine />
            </Link>
          </div>
        </section>

        <SupportContactCard />
      </div>
    </div>
  );
};

export default HelpLandingPage;
