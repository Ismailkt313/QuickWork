import React from "react";

interface ServicesHeaderProps {
  total: number;
}

const ServicesHeader: React.FC<ServicesHeaderProps> = ({ total }) => (
  <section className="qw-services-hero">
    <div className="container qw-container">
      <nav aria-label="breadcrumb" className="qw-breadcrumb mb-3">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <a href="/" className="qw-breadcrumb-link">
              Home
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            All Services
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
        <div>
          <h1 className="qw-services-hero-title mb-2">Browse All Services</h1>
          <p className="qw-services-hero-sub mb-0">
            Discover trusted professionals across every category
          </p>
        </div>
        {total > 0 && (
          <span className="qw-services-count-badge">
            {total} services available
          </span>
        )}
      </div>
    </div>
  </section>
);

export default ServicesHeader;
