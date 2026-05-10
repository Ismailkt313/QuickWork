import React, { useState } from "react";
import { RiSearchLine, RiCloseLine } from "react-icons/ri";

export const HelpHeroSection: React.FC = () => {
  const [search, setSearch] = useState("");

  return (
    <section className="hc-hero">
      <div className="hc-container">
        <h1 className="hc-hero-title">How can we help you?</h1>
        <p className="hc-hero-subtitle">
          Everything you need to know about using QuickWork to hire professionals or grow your business.
        </p>
        <div className="hc-search-wrapper">
          <RiSearchLine className="hc-search-icon" />
          <input 
            type="text" 
            className="hc-search-input" 
            placeholder="Search for articles, guides, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <RiCloseLine size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export const HelpCategoryCard: React.FC<{ 
  to: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}> = ({ to, icon, title, description }) => (
  <a href={to} className="hc-category-card">
    <div className="hc-category-icon">{icon}</div>
    <h3 className="hc-category-title">{title}</h3>
    <p className="hc-category-desc">{description}</p>
  </a>
);

export const HelpFAQAccordion: React.FC<{ 
  items: { question: string; answer: string }[] 
}> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="hc-faq-list">
      {items.map((item, index) => (
        <div key={index} className="hc-faq-item">
          <button 
            className="hc-faq-trigger"
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            {item.question}
            <span>{activeIndex === index ? "−" : "+"}</span>
          </button>
          {activeIndex === index && (
            <div className="hc-faq-content">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const SupportContactCard: React.FC = () => (
  <div className="hc-contact-card">
    <h3>Still need help?</h3>
    <p>Our support team is available 24/7 to assist you with any questions or concerns.</p>
    <button className="hc-contact-btn">Contact Support Team</button>
  </div>
);
