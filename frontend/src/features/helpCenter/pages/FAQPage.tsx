import React from "react";
import { HelpCenterLayout } from "../components/HelpCenterLayout";
import { HelpFAQAccordion } from "../components/HelpComponents";
import { RiQuestionLine } from "react-icons/ri";

const FAQPage: React.FC = () => {
  const categories = [
    {
      title: "General Questions",
      items: [
        {
          question: "What is QuickWork?",
          answer: "QuickWork is a platform that connects clients with local service professionals for various tasks, from home repairs to digital services."
        },
        {
          question: "Is it free to join?",
          answer: "Yes, creating an account is completely free for both clients and professionals."
        }
      ]
    },
    {
      title: "For Clients",
      items: [
        {
          question: "How do I hire someone?",
          answer: "You can either browse professional profiles and click 'Hire' or post a job and wait for professionals to apply."
        },
        {
          question: "Can I pay in cash?",
          answer: "For your safety and to ensure the platform guarantee, all payments should be made through our secure online payment system."
        }
      ]
    },
    {
      title: "For Professionals",
      items: [
        {
          question: "How do I get verified?",
          answer: "Complete your profile, add portfolio items, and submit your identity documents through the 'Become a Provider' section in your settings."
        },
        {
          question: "How much does QuickWork charge?",
          answer: "We charge a small service fee on completed jobs. You can see the exact breakdown before you accept any job."
        }
      ]
    },
    {
      title: "Technical Support",
      items: [
        {
          question: "I forgot my password, what should I do?",
          answer: "Click 'Forgot Password' on the login screen, and we will send you a secure link to reset it."
        },
        {
          question: "How do I change my location?",
          answer: "You can update your work location or service area in your Profile Settings."
        }
      ]
    }
  ];

  return (
    <HelpCenterLayout>
      <div className="hc-article-header">
        <h1 className="hc-article-title">Frequently Asked Questions</h1>
        <p className="hc-article-meta">Common questions and answers to help you navigate QuickWork.</p>
      </div>

      {categories.map((cat, i) => (
        <section key={i} className="hc-section">
          <h2 className="hc-section-title"><RiQuestionLine color="var(--hc-primary)" /> {cat.title}</h2>
          <HelpFAQAccordion items={cat.items} />
        </section>
      ))}
    </HelpCenterLayout>
  );
};

export default FAQPage;
