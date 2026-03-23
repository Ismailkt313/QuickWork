import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import { getProviderById } from '../services/providersService';
import { getLandingData, type Location } from '../../landingPage/services/landingService';

interface ProviderDetail {
    _id: string;
    headline: string;
    about: string;
    profileImage: string;
    skills: { _id: string; name: string; slug?: string }[];
    yearsOfExperience: number;
    hourlyRate: number;
    location: { id: string; name: string; lat: number; lon: number };
    portfolio: { title: string; description?: string; images: string[] }[];
    createdAt: string;
}

const ProviderDetailPage: React.FC = () => {
    const { providerId } = useParams<{ providerId: string }>();
    const navigate = useNavigate();

    const [provider, setProvider] = useState<ProviderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState<Location[]>([]);
    const [lightbox, setLightbox] = useState<string | null>(null);

    useEffect(() => {
        getLandingData().then(d => setLocations(d.locations)).catch(() => {});
    }, []);

    useEffect(() => {
        if (!providerId) return;
        setLoading(true);
        getProviderById(providerId)
            .then(res => {
                if (res.success) setProvider(res.data);
                else setError(res.message || 'Provider not found');
            })
            .catch(() => setError('Failed to load provider details'))
            .finally(() => setLoading(false));
    }, [providerId]);

    if (loading) {
        return (
            <MainLayout locations={locations} selectedLocation={null} onSelectLocation={() => {}} onClearLocation={() => {}}>
                <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner-border text-primary" style={{ width: 48, height: 48 }}></div>
                </div>
            </MainLayout>
        );
    }

    if (error || !provider) {
        return (
            <MainLayout locations={locations} selectedLocation={null} onSelectLocation={() => {}} onClearLocation={() => {}}>
                <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>😔</div>
                    <h3 className="fw-bold" style={{ color: '#1e293b' }}>{error || 'Provider not found'}</h3>
                    <button onClick={() => navigate(-1)} className="btn mt-3" style={{ padding: '10px 28px', borderRadius: 10, background: '#3b82f6', color: '#fff', fontWeight: 600, border: 'none' }}>
                        Go Back
                    </button>
                </div>
            </MainLayout>
        );
    }

    const joinedDate = new Date(provider.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <MainLayout locations={locations} selectedLocation={null} onSelectLocation={() => {}} onClearLocation={() => {}}>
            <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)', padding: '32px 0 80px' }}>
                <div className="container">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <span onClick={() => navigate('/')} style={{ color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Home</span>
                        <span style={{ color: '#475569', fontSize: 13 }}>/</span>
                        <span onClick={() => navigate(-1)} style={{ color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>Providers</span>
                        <span style={{ color: '#475569', fontSize: 13 }}>/</span>
                        <span style={{ color: '#e2e8f0', fontSize: 13 }}>{provider.headline}</span>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: -60, position: 'relative', zIndex: 5, paddingBottom: 64 }}>
                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="card border-0 rounded-4 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                            <div style={{ height: 280, overflow: 'hidden', background: '#f1f5f9' }}>
                                <img
                                    src={provider.profileImage}
                                    alt={provider.headline}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.headline)}&size=400&background=3b82f6&color=fff`;
                                    }}
                                />
                            </div>
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-1" style={{ color: '#0f172a', fontSize: 20 }}>{provider.headline}</h4>
                                <div className="d-flex align-items-center gap-2 mb-3 mt-2">
                                    <span style={{ fontSize: 14, color: '#64748b' }}>📍 {provider.location.name}</span>
                                    <span style={{ fontSize: 14, color: '#64748b' }}>•</span>
                                    <span style={{ fontSize: 14, color: '#64748b' }}>Joined {joinedDate}</span>
                                </div>

                                <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: '#f8fafc' }}>
                                    <div className="text-center flex-fill">
                                        <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>₹{provider.hourlyRate}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>per hour</div>
                                    </div>
                                    <div style={{ width: 1, height: 36, background: '#e2e8f0' }}></div>
                                    <div className="text-center flex-fill">
                                        <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{provider.yearsOfExperience}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>yrs experience</div>
                                    </div>
                                    <div style={{ width: 1, height: 36, background: '#e2e8f0' }}></div>
                                    <div className="text-center flex-fill">
                                        <div style={{ fontSize: 22, fontWeight: 700, color: '#16a34a' }}>✓</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Verified</div>
                                    </div>
                                </div>

                                <button
                                    className="btn w-100 mb-2"
                                    style={{
                                        padding: '12px', borderRadius: 12,
                                        background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none',
                                        color: '#fff', fontSize: 15, fontWeight: 700,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.35)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    ⚡ Direct Hire
                                </button>
                                <button
                                    className="btn w-100"
                                    style={{
                                        padding: '12px', borderRadius: 12,
                                        background: '#fff', border: '1.5px solid #e2e8f0',
                                        color: '#1e293b', fontSize: 15, fontWeight: 700,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}
                                >
                                    💬 Message Provider
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="card border-0 rounded-4 p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                            <h5 className="fw-bold mb-3" style={{ color: '#0f172a', fontSize: 18 }}>About</h5>
                            <p style={{ color: '#475569', fontSize: 14.5, lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>
                                {provider.about}
                            </p>
                        </div>

                        <div className="card border-0 rounded-4 p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                            <h5 className="fw-bold mb-3" style={{ color: '#0f172a', fontSize: 18 }}>Skills</h5>
                            <div className="d-flex flex-wrap gap-2">
                                {provider.skills.map(skill => (
                                    <span
                                        key={skill._id}
                                        onClick={() => navigate(`/user/services/${skill._id}?name=${encodeURIComponent(skill.name)}`)}
                                        style={{
                                            padding: '8px 16px', borderRadius: 20,
                                            background: '#eff6ff', color: '#2563eb',
                                            fontSize: 13, fontWeight: 600,
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            textTransform: 'capitalize',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; }}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {provider.portfolio.length > 0 && (
                            <div className="card border-0 rounded-4 p-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                                <h5 className="fw-bold mb-3" style={{ color: '#0f172a', fontSize: 18 }}>
                                    Portfolio ({provider.portfolio.length} {provider.portfolio.length === 1 ? 'project' : 'projects'})
                                </h5>
                                {provider.portfolio.map((project, idx) => (
                                    <div key={idx} className={idx > 0 ? 'mt-4 pt-4' : ''} style={idx > 0 ? { borderTop: '1px solid #f1f5f9' } : {}}>
                                        <h6 className="fw-bold mb-1" style={{ color: '#1e293b', fontSize: 15 }}>{project.title}</h6>
                                        {project.description && (
                                            <p style={{ color: '#64748b', fontSize: 13.5, marginBottom: 12 }}>{project.description}</p>
                                        )}
                                        <div className="d-flex flex-wrap gap-2">
                                            {project.images.map((img, imgIdx) => (
                                                <div
                                                    key={imgIdx}
                                                    onClick={() => setLightbox(img)}
                                                    style={{
                                                        width: 120, height: 90, borderRadius: 10, overflow: 'hidden',
                                                        cursor: 'pointer', transition: 'transform 0.2s',
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                                >
                                                    <img src={img} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 2000,
                        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', animation: 'qwFadeIn 0.18s ease',
                    }}
                >
                    <img
                        src={lightbox}
                        alt="Full preview"
                        style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain' }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightbox(null)}
                        style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10,
                            width: 40, height: 40, color: '#fff', fontSize: 20, cursor: 'pointer',
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </MainLayout>
    );
};

export default ProviderDetailPage;
