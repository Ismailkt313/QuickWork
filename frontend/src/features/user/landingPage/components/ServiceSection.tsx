import React from 'react';
import { useNavigate } from 'react-router-dom';
import SkillsScroller from '../components/SkillsScroller';
import type { Skill, Location } from '../services/landingService';

interface ServiceSectionProps {
  skills: Skill[];
  loading: boolean;
  error: string | null;
  selectedLocation?: Location | null;
  onOpenLocationModal?: () => void;
  onClearLocation?: () => void;
  onSkillClick?: (skill: Skill) => void;
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
  skills, loading, error, selectedLocation, onOpenLocationModal, onClearLocation, onSkillClick,
}) => {
  const navigate = useNavigate();

  return (
    <section id="services" style={{ background: '#f8fafc', padding: '64px 0 72px' }}>
      <div className="container">
        {/* Header row */}
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              {selectedLocation ? `Services in ${selectedLocation.name}` : 'Popular Services'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#64748b' }}>
              {selectedLocation
                ? 'Showing skills available in your selected area'
                : 'Browse all available home and business services'}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {selectedLocation && (
              <button
                onClick={onClearLocation}
                style={{
                  padding: '7px 14px', borderRadius: 20, border: '1.5px solid #e2e8f0',
                  background: '#fff', fontSize: 12.5, fontWeight: 600, color: '#64748b', cursor: 'pointer',
                }}
              >
                ✕ Clear filter
              </button>
            )}
            <button
              onClick={onOpenLocationModal}
              style={{
                padding: '8px 18px', borderRadius: 20, border: '1.5px solid',
                borderColor: selectedLocation ? '#bfdbfe' : '#3b82f6',
                background: selectedLocation ? '#eff6ff' : '#3b82f6',
                color: selectedLocation ? '#1d4ed8' : '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              📍 {selectedLocation ? selectedLocation.name : 'Choose Location'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Scroller */}
        <SkillsScroller skills={skills} loading={loading} onSkillClick={onSkillClick} />

        {/* Empty state */}
        {!loading && skills.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 15, marginBottom: 0 }}>No services found in this location yet.</p>
            <button
              onClick={onClearLocation}
              style={{ marginTop: 14, padding: '8px 24px', borderRadius: 20, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Show all services
            </button>
          </div>
        )}

         {!loading && skills.length > 0 && (
          <div className="text-center mt-5">
            <button
              onClick={() => navigate('/user/services')}
              style={{
                padding: '12px 40px', borderRadius: 12, border: '1.5px solid #e2e8f0',
                background: '#fff', fontSize: 14, fontWeight: 600, color: '#1e293b', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#1e293b';
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                (e.currentTarget as HTMLButtonElement).style.color = '#1e293b';
              }}
            >
              Show All Services →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServiceSection;
