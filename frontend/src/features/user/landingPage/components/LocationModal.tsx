import React, { useEffect, useRef } from 'react';
import type { Location } from '../services/landingService';

interface LocationModalProps {
  isOpen: boolean;
  locations: Location[];
  selectedLocationId?: string;
  onSelect: (location: Location) => void;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  locations,
  selectedLocationId,
  onSelect,
  onClose,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1050,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'qwFadeIn 0.18s ease',
      }}
    >
      <div
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460,
          maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          animation: 'qwSlideUp 0.22s cubic-bezier(.34,1.56,.64,1)',
          margin: '0 16px',
        }}
      >

        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h5 style={{ margin: 0, fontWeight: 700, fontSize: 17, color: '#0f172a' }}>Choose your location</h5>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Select a city to see available services
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Location list */}
        <div style={{ overflowY: 'auto', padding: '12px 16px' }}>
          {locations.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 14 }}>
              No locations available
            </p>
          ) : (
            locations.map((loc) => {
              const isSelected = loc._id === selectedLocationId;
              return (
                <button
                  key={loc._id}
                  onClick={() => onSelect(loc)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 14px', marginBottom: 4, border: 'none', borderRadius: 10,
                    background: isSelected ? '#eff6ff' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                    outline: isSelected ? '1.5px solid #3b82f6' : 'none',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: 8, background: isSelected ? '#dbeafe' : '#f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    📍
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                      {loc.name}
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', color: '#3b82f6', fontSize: 18 }}>✓</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
