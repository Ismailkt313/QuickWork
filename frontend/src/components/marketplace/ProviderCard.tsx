import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProviderItem } from '../../features/user/serviceProviders/services/providersService';

interface ProviderCardProps {
    provider: ProviderItem;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
    const navigate = useNavigate();

    return (
        <div className="col-sm-6 col-lg-4">
            <div
                className="card border-0 h-100 overflow-hidden"
                onClick={() => navigate(`/user/services/provider/${provider.id}`)}
                style={{
                    borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'all 0.22s ease',
                    cursor: 'pointer',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,130,246,0.15)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                }}
            >
                <div style={{ height: 200, overflow: 'hidden', background: '#f1f5f9' }}>
                    <img
                        src={provider.profileImage}
                        alt={provider.headline}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => {
                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(provider.headline) + '&size=400&background=3b82f6&color=fff';
                        }}
                    />
                </div>

                <div className="card-body p-3">
                    <h6 className="fw-bold mb-2" style={{ fontSize: 15, color: '#0f172a', lineHeight: 1.3 }}>
                        {provider.headline}
                    </h6>

                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 10px', borderRadius: 20,
                            background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600,
                        }}>
                            🕐 {provider.yearsOfExperience} {provider.yearsOfExperience === 1 ? 'yr' : 'yrs'}
                        </span>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 10px', borderRadius: 20,
                            background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600,
                        }}>
                            📍 {provider.location.name}
                        </span>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mt-3">
                        <div>
                            <span style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>₹{provider.hourlyRate}</span>
                            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 2 }}>/hr</span>
                        </div>
                        <button
                            className="btn btn-sm"
                            style={{
                                padding: '6px 18px', borderRadius: 10,
                                background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff',
                                fontSize: 12.5, fontWeight: 600, border: 'none',
                            }}
                        >
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderCard;
