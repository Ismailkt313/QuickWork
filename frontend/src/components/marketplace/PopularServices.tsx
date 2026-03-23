import React from 'react'
import type { Service,PopularServicesProps } from '../../types/service/service.types';

const SERVICE_ICONS: Record<string, string> = {
  plumbing: '🔧',
  painting: '🖌️',
  electrical: '⚡',
  cleaning: '🧹',
  gardening: '🌿',
  moving: '🚛',
  carpentry: '🪚',
  roofing: '🏠',
  hvac: '❄️',
  pest: '🐛',
  default: '🛠️',
};

const getIcon = (service: Service): string => {
  if (service.icon) return service.icon;
  const key = service.slug?.toLowerCase() || '';
  return (
    Object.entries(SERVICE_ICONS).find(([k]) => key.includes(k))?.[1] ||
    SERVICE_ICONS.default
  );
};

 const ServiceCard: React.FC<{ service: Service }> = ({ service }) => (
  <div className="col-6 col-md-4 col-lg-2">
    <a
      href={`/services/${service.slug}`}
      className="qw-service-card text-decoration-none d-flex flex-column align-items-center text-center p-3 h-100"
    >
      <div className="qw-service-icon mb-3">{getIcon(service)}</div>
      <span className="qw-service-name">{service.name}</span>
    </a>
  </div>
);

const SkeletonCard: React.FC = () => (
  <div className="col-6 col-md-4 col-lg-2">
    <div className="qw-service-card p-3 h-100">
      <div className="qw-skeleton qw-skeleton-icon mx-auto mb-3" />
      <div className="qw-skeleton qw-skeleton-text mx-auto" />
    </div>
  </div>
);

const PopularServices: React.FC<PopularServicesProps> = ({ services, loading, error }) => {
  return (
      <section className="qw-section-light py-5">
          <div className="container qw-container">
              <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="qw-section-title mb-0">Popular Services</h2>
                  <a href="/services" className="qw-view-all">
            View all →
          </a>
              </div>
              {error && <div className="alert qw-alert-error" role="alert">
            <span>⚠️</span> {error}
              </div>}
              <div className="row g-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : services.map((service: Service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
        </div>
            </div>
    </section>
  )
}

export default PopularServices
