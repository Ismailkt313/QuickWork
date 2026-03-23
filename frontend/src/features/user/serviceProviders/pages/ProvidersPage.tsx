import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../layout/MainLayout';
import ProviderCard from '../../../../components/marketplace/ProviderCard';
import Pagination from '../../../../components/ui/Pagination';
import LocationModal from '../../landingPage/components/LocationModal';
import { useProviders } from '../../../provider/hooks/useProviders';
import { getLandingData, type Location } from '../../landingPage/services/landingService';

const ProvidersPage: React.FC = () => {
    const { skillId } = useParams<{ skillId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const skillName = searchParams.get('name') || 'Service';
    const [sort, setSort] = useState('');
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const savedLocId = localStorage.getItem('locationId');
        getLandingData().then(data => {
            setLocations(data.locations);
            if (savedLocId) {
                const found = data.locations.find(l => l._id === savedLocId);
                if (found) setSelectedLocation(found);
            }
        }).catch(() => {});
    }, []);

    const { providers, pagination, loading, setPage } = useProviders({
        skillId: skillId || '',
        locationId: selectedLocation?._id,
        sort,
    });

    const handleSelectLocation = (loc: Location) => {
        setSelectedLocation(loc);
        localStorage.setItem('locationId', loc._id);
        setModalOpen(false);
    };

    const handleClearLocation = () => {
        setSelectedLocation(null);
        localStorage.removeItem('locationId');
    };

    const skeletons = Array.from({ length: 6 });

    return (
        <MainLayout
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onClearLocation={handleClearLocation}
        >
            <div style={{
                background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
                padding: '48px 0 40px',
            }}>
                <div className="container">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span
                            onClick={() => navigate('/')}
                            style={{ color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
                        >Home</span>
                        <span style={{ color: '#475569', fontSize: 13 }}>/</span>
                        <span
                            onClick={() => navigate('/user/services')}
                            style={{ color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
                        >Services</span>
                        <span style={{ color: '#475569', fontSize: 13 }}>/</span>
                        <span style={{ color: '#e2e8f0', fontSize: 13 }}>{skillName}</span>
                    </div>
                    <h1 style={{
                        fontSize: 28, fontWeight: 700, color: '#fff', margin: '8px 0 4px',
                    }}>
                        Available <span style={{ color: '#60a5fa' }}>{skillName}s</span> Near You
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                        {pagination ? `${pagination.total} professional${pagination.total !== 1 ? 's' : ''} found` : 'Searching...'}
                    </p>
                </div>
            </div>

            <div className="container py-4">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
                    style={{
                        position: 'sticky', top: 64, zIndex: 10,
                        background: '#fff', margin: '0 -12px', padding: '12px 12px',
                        borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        border: '1px solid #f1f5f9',
                    }}
                >
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setModalOpen(true)}
                            style={{
                                padding: '8px 16px', borderRadius: 10,
                                border: '1.5px solid',
                                borderColor: selectedLocation ? '#bfdbfe' : '#e2e8f0',
                                background: selectedLocation ? '#eff6ff' : '#fff',
                                color: selectedLocation ? '#1d4ed8' : '#64748b',
                                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}
                        >
                            📍 {selectedLocation ? selectedLocation.name : 'All Locations'}
                        </button>

                        {selectedLocation && (
                            <button
                                onClick={handleClearLocation}
                                style={{
                                    padding: '6px 12px', borderRadius: 10,
                                    border: '1px solid #fecaca', background: '#fef2f2',
                                    color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: 12.5, color: '#94a3b8', fontWeight: 500 }}>Sort by:</span>
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className="form-select form-select-sm"
                            style={{
                                width: 'auto', borderRadius: 10, border: '1.5px solid #e2e8f0',
                                fontSize: 13, fontWeight: 600, color: '#1e293b',
                                padding: '6px 32px 6px 12px',
                            }}
                        >
                            <option value="">Default</option>
                            <option value="price_low">Price: Low → High</option>
                            <option value="price_high">Price: High → Low</option>
                            <option value="experience">Most Experienced</option>
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="row g-4">
                        {skeletons.map((_, i) => (
                            <div key={i} className="col-sm-6 col-lg-4">
                                <div className="card border-0" style={{ borderRadius: 16, overflow: 'hidden' }}>
                                    <div className="placeholder-glow">
                                        <div className="placeholder" style={{ width: '100%', height: 200, background: '#e2e8f0' }}></div>
                                    </div>
                                    <div className="card-body p-3">
                                        <div className="placeholder-glow">
                                            <span className="placeholder col-8 mb-2" style={{ height: 16, borderRadius: 6 }}></span>
                                            <span className="placeholder col-5" style={{ height: 12, borderRadius: 6 }}></span>
                                        </div>
                                        <div className="d-flex justify-content-between mt-3 placeholder-glow">
                                            <span className="placeholder col-3" style={{ height: 20, borderRadius: 6 }}></span>
                                            <span className="placeholder col-4" style={{ height: 30, borderRadius: 10 }}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && providers.length > 0 && (
                    <>
                        <div className="row g-4">
                            {providers.map(p => (
                                <ProviderCard key={p.id} provider={p} />
                            ))}
                        </div>
                        {pagination && (
                            <Pagination pagination={pagination} onPageChange={setPage} />
                        )}
                    </>
                )}

                {!loading && providers.length === 0 && (
                    <div className="text-center py-5">
                        <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
                        <h5 className="fw-bold" style={{ color: '#1e293b' }}>
                            No providers available for this service
                            {selectedLocation ? ` in ${selectedLocation.name}` : ''}
                        </h5>
                        <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 400, margin: '8px auto 24px' }}>
                            Try changing your location or browse other services to find what you need.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            {selectedLocation && (
                                <button
                                    onClick={handleClearLocation}
                                    className="btn"
                                    style={{
                                        padding: '10px 24px', borderRadius: 10,
                                        border: '1.5px solid #e2e8f0', background: '#fff',
                                        fontSize: 13, fontWeight: 600, color: '#1e293b',
                                    }}
                                >
                                    Show All Locations
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/user/services')}
                                className="btn"
                                style={{
                                    padding: '10px 24px', borderRadius: 10,
                                    background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none',
                                    fontSize: 13, fontWeight: 600, color: '#fff',
                                }}
                            >
                                Browse Other Services
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <LocationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                locations={locations}
                selectedLocationId={selectedLocation?._id}
                onSelect={handleSelectLocation}
            />
        </MainLayout>
    );
};

export default ProvidersPage;
