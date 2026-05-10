import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import ProviderCard from "../../../../components/marketplace/ProviderCard";
import CompactProviderCard from "../../../../components/marketplace/CompactProviderCard";
import Pagination from "../../../../components/ui/Pagination";
import LocationModal from "../../landingPage/components/LocationModal";
import { useProviders } from "../../../provider/hooks/useProviders";
import {
  getLandingData,
  type Location,
} from "../../landingPage/services/landingService";

const ProvidersPage: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const skillName = searchParams.get("name") || "Service";
  const [sort, setSort] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    const savedLocId = localStorage.getItem("locationId");
    getLandingData()
      .then((data) => {
        setLocations(data.locations);
        if (savedLocId) {
          const found = data.locations.find((l) => l._id === savedLocId);
          if (found) setSelectedLocation(found);
        }
      })
      .catch(() => {});
  }, []);

  const { providers, pagination, loading, setPage } = useProviders({
    skillId: skillId || "",
    locationId: selectedLocation?._id,
    sort,
    search: debouncedSearch,
  });

  const handleSelectLocation = (loc: Location) => {
    setSelectedLocation(loc);
    localStorage.setItem("locationId", loc._id);
    setModalOpen(false);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    localStorage.removeItem("locationId");
  };

  const skeletons = Array.from({ length: 8 });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <MainLayout
      locations={locations}
      selectedLocation={selectedLocation}
      onSelectLocation={handleSelectLocation}
      onClearLocation={handleClearLocation}
    >
      <style>{`
        .providers-hero {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          padding: 64px 0 54px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .hero-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .breadcrumb-item {
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .breadcrumb-item:hover { color: #fff; }
        .breadcrumb-sep { color: #475569; font-size: 13px; }
        .breadcrumb-active { color: #e2e8f0; font-size: 13px; }

        .hero-title {
          font-size: 36px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -1px;
          margin: 0 0 8px;
        }
        
        .hero-title span { color: #3b82f6; }
        .hero-stats { color: #94a3b8; font-size: 15px; font-weight: 500; }

        .filter-bar {
          position: sticky;
          top: 80px;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          margin-top: -32px;
          padding: 16px 24px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .filter-left { display: flex; align-items: center; gap: 12px; flex: 1; }
        .filter-right { display: flex; align-items: center; gap: 12px; }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 16px;
        }

        .search-input {
          width: 100%;
          height: 48px;
          padding-left: 44px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .location-btn {
          height: 48px;
          padding: 0 20px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-weight: 600;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .location-btn:hover { border-color: #3b82f6; color: #3b82f6; }
        .location-btn.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }

        .sort-select {
          height: 48px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-weight: 600;
          color: #1e293b;
          min-width: 140px;
        }

        .provider-grid {
          display: grid;
          gap: 32px;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 40px;
        }

        @media (max-width: 1500px) { .provider-grid { gap: 24px; } }
        @media (max-width: 1300px) { .provider-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (max-width: 991px) { .provider-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }

        @media (max-width: 767px) {
          .providers-hero { padding: 40px 0 60px; text-align: center; }
          .hero-breadcrumb { justify-content: center; }
          .hero-title { font-size: 26px; }
          
          .filter-bar {
            top: 70px;
            margin-top: -40px;
            padding: 12px;
            gap: 8px;
            flex-direction: column;
            border-radius: 16px;
          }
          .filter-left, .filter-right { width: 100%; }
          .search-container { max-width: none; }
          .search-input { height: 44px; padding-left: 38px; font-size: 14px; }
          .search-icon { left: 12px; font-size: 14px; }
          .location-btn { height: 44px; padding: 0 12px; font-size: 13px; flex: 1; }
          .sort-select { height: 44px; min-width: 100px; flex: 1; font-size: 13px; }
          
          .provider-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-top: 24px;
          }
        }

        @media (max-width: 420px) {
          .provider-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="providers-hero">
        <div className="container">
          <div className="hero-breadcrumb">
            <span className="breadcrumb-item" onClick={() => navigate("/")}>Home</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-item" onClick={() => navigate("/user/services")}>Services</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-active">{skillName}</span>
          </div>
          <h1 className="hero-title">
            Available <span>{skillName}s</span>
          </h1>
          <p className="hero-stats">
            {pagination
              ? `${pagination.total} professional${pagination.total !== 1 ? "s" : ""} in your area`
              : "Finding the best pros..."}
          </p>
        </div>
      </div>

      <div className="container py-4">
        <div className="filter-bar">
          <div className="filter-left">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="form-control search-input"
              />
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className={`location-btn ${selectedLocation ? 'active' : ''}`}
            >
              📍 {selectedLocation ? selectedLocation.name : "All Locations"}
            </button>
          </div>
          <div className="filter-right">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-select sort-select"
            >
              <option value="">Sort By: Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="experience">Experience: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="provider-grid">
            {skeletons.map((_, i) => (
              <div key={i} className="skeleton-placeholder">
                <div style={{
                  height: 280,
                  borderRadius: 20,
                  background: '#fff',
                  border: '1px solid #f1f5f9',
                  overflow: 'hidden'
                }}>
                  <div className="placeholder-glow h-100">
                    <div className="placeholder w-100" style={{ height: '60%', background: '#f8fafc' }} />
                    <div className="p-3">
                      <div className="placeholder col-10 mb-2" style={{ height: 16, borderRadius: 4 }} />
                      <div className="placeholder col-6" style={{ height: 12, borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : providers.length > 0 ? (
          <>
            <div className="provider-grid">
              {providers.map((p) => (
                <div key={p.id}>
                  {isMobile ? (
                    <CompactProviderCard provider={p} />
                  ) : (
                    <ProviderCard provider={p} />
                  )}
                </div>
              ))}
            </div>
            {pagination && (
              <Pagination pagination={pagination} onPageChange={setPage} />
            )}
          </>
        ) : (
          <div className="text-center py-5 mt-5">
            <div style={{ fontSize: 64, marginBottom: 20 }}>🔎</div>
            <h3 className="fw-bold" style={{ color: "#0f172a" }}>
              No providers matched your search
            </h3>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "12px auto 32px" }}>
              Try adjusting your filters, changing the location, or searching for a different keyword.
            </p>
            <div className="d-flex justify-content-center gap-3">
              {selectedLocation && (
                <button
                  onClick={handleClearLocation}
                  className="btn btn-outline-secondary px-4 py-2 fw-bold"
                  style={{ borderRadius: 12 }}
                >
                  Clear Location
                </button>
              )}
              <button
                onClick={() => navigate("/user/services")}
                className="btn btn-primary px-4 py-2 fw-bold"
                style={{ borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none' }}
              >
                Explore Services
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
