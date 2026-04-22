import React from "react";

interface SectionCardProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  stepNumber,
  title,
  children,
}) => {
  return (
    <div className="mb-5">
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
          style={{
            width: "32px",
            height: "32px",
            fontSize: "0.9rem",
            fontWeight: "bold",
          }}
        >
          {stepNumber}
        </div>
        <h4
          className="mb-0 text-dark fw-bold"
          style={{ fontSize: "1.2rem", letterSpacing: "-0.01em" }}
        >
          {title}
        </h4>
      </div>
      <div>{children}</div>
    </div>
  );
};
