import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../../services/api";
import MainLayout from "../../layout/MainLayout";
import { useLandingData } from "../../hooks/useLandingData";
import LocationModal from "../../landingPage/components/LocationModal";
import type { Location } from "../../landingPage/services/landingService";

const SKILL_ICONS: Record<string, string> = {
  plumbing: "🔧",
  painting: "🖌️",
  electrical: "⚡",
  cleaning: "🧹",
  gardening: "🌿",
  moving: "🚛",
  carpentry: "🪚",
  roofing: "🏠",
  hvac: "❄️",
  pest: "🐛",
  security: "🔒",
  appliance: "📦",
  beauty: "💅",
  wellness: "🧘",
  tutoring: "📚",
  cooking: "🍳",
  photography: "📷",
  design: "🎨",
  it: "💻",
  mechanic: "🔩",
};

const getIcon = (name: string, slug?: string) => {
  const key = (slug ?? name ?? "").toLowerCase();
  return (
    Object.entries(SKILL_ICONS).find(([k]) => key.includes(k))?.[1] ?? "🛠️"
  );
};

interface Skill {
  _id: string;
  name: string;
  slug?: string;
  icon?: string;
}

const AllServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { locations, selectedLocation, selectLocation, clearLocation } =
    useLandingData();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [search]);
  const fetchSkills = useCallback(async (q: string, locId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (q) params.search = q;
      if (locId) params.locationId = locId;
      const res = await api.get("/skills/all", { params });
      setSkills(res.data.data ?? []);
    } catch {
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills(debouncedSearch, selectedLocation?._id);
  }, [debouncedSearch, selectedLocation, fetchSkills]);

  const handleSelectLocation = (loc: Location) => {
    selectLocation(loc);
    setModalOpen(false);
  };

  return (
    <MainLayout
      locations={locations}
      selectedLocation={selectedLocation}
      onSelectLocation={selectLocation}
      onClearLocation={clearLocation}
    >
      <div
        style={{
          background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
          padding: "48px 0 40px",
        }}
      >
        <div className="container">
          <nav style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
            <a href="/" style={{ color: "#64748b", textDecoration: "none" }}>
              Home
            </a>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#cbd5e1" }}>All Services</span>
          </nav>
          <h1
            style={{
              fontSize: "clamp(1.6rem,4vw,2.4rem)",
              fontWeight: 800,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            All Services
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 8, fontSize: 15 }}>
            {skills.length > 0
              ? `${skills.length} services available`
              : "Browse all available services"}
            {selectedLocation ? ` in ${selectedLocation.name}` : ""}
          </p>

          <div style={{ marginTop: 24, maxWidth: 520, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 16,
                color: "#64748b",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search services (e.g. plumbing, cleaning...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.08)",
                color: "#f1f5f9",
                fontSize: 14,
                outline: "none",
                backdropFilter: "blur(8px)",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #f1f5f9",
          padding: "12px 0",
          position: "sticky",
          top: 64,
          zIndex: 20,
        }}
      >
        <div className="container d-flex align-items-center gap-3 flex-wrap">
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            Filter by:
          </span>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              border: "1.5px solid",
              borderColor: selectedLocation ? "#bfdbfe" : "#e2e8f0",
              background: selectedLocation ? "#eff6ff" : "#f8fafc",
              color: selectedLocation ? "#1d4ed8" : "#64748b",
            }}
          >
            📍 {selectedLocation?.name ?? "Choose Location"}
          </button>
          {selectedLocation && (
            <button
              onClick={clearLocation}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#94a3b8",
                cursor: "pointer",
              }}
            >
              ✕ Clear
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>
            {!loading &&
              `${skills.length} result${skills.length !== 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div
        style={{
          background: "#f8fafc",
          minHeight: "60vh",
          padding: "40px 0 64px",
        }}
      >
        <div className="container">
          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 24,
                fontSize: 14,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 16,
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "#f1f5f9",
                    borderRadius: 14,
                    padding: "24px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: "#e2e8f0",
                    }}
                  />
                  <div
                    style={{
                      width: 80,
                      height: 12,
                      borderRadius: 6,
                      background: "#e2e8f0",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "#94a3b8",
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
              <h3
                style={{ fontWeight: 700, color: "#475569", marginBottom: 8 }}
              >
                No services found
              </h3>
              <p style={{ fontSize: 14 }}>
                {search
                  ? `No results for "${search}". Try a different keyword.`
                  : "No services available right now."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    marginTop: 16,
                    padding: "10px 24px",
                    borderRadius: 10,
                    border: "none",
                    background: "#3b82f6",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: 16,
              }}
            >
              {skills.map((skill) => (
                <div
                  key={skill._id}
                  onClick={() =>
                    navigate(
                      `/user/services/${skill._id}?name=${encodeURIComponent(skill.name)}`,
                    )
                  }
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    padding: "24px 12px",
                    textAlign: "center",
                    cursor: "pointer",
                    border: "1.5px solid #f1f5f9",
                    transition: "all 0.22s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-5px)";
                    el.style.boxShadow = "0 10px 28px rgba(59,130,246,0.14)";
                    el.style.borderColor = "#bfdbfe";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                    el.style.borderColor = "#f1f5f9";
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 14,
                      background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                    }}
                  >
                    {skill.icon ?? getIcon(skill.name, skill.slug)}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1e293b",
                      textTransform: "capitalize",
                      lineHeight: 1.3,
                    }}
                  >
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <LocationModal
        isOpen={modalOpen}
        locations={locations}
        selectedLocationId={selectedLocation?._id}
        onSelect={handleSelectLocation}
        onClose={() => setModalOpen(false)}
      />
    </MainLayout>
  );
};

export default AllServicesPage;
