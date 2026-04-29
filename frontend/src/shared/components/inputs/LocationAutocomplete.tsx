import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiMapPin, FiSearch, FiLoader } from "react-icons/fi";
import { GEOAPIFY_API_KEY } from "../../../features/user/jobs/constants/locationConstants";

interface Suggestion {
  formatted: string;
  lat: number;
  lon: number;
  district?: string;
  place_id: string;
}

interface LocationAutocompleteProps {
  label: string;
  districtName: string;
  center?: [number, number];
  onSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    district: string;
  }) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  districtName,
  center,
  onSelect,
  error,
  helperText,
  required,
  disabled,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!text || text.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        let url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${GEOAPIFY_API_KEY}&limit=5`;

        // Apply circle filter if center is available (within 20km of district center)
        if (center) {
          const [lng, lat] = center;
          url += `&filter=circle:${lng},${lat},20000`;
          url += `&bias=proximity:${lng},${lat}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.features) {
          interface GeoapifyFeature {
            properties: {
              formatted: string;
              lat: number;
              lon: number;
              district?: string;
              city?: string;
              place_id: string;
            };
          }
          const results = data.features.map((f: GeoapifyFeature) => ({
            formatted: f.properties.formatted,
            lat: f.properties.lat,
            lon: f.properties.lon,
            district: f.properties.district || f.properties.city,
            place_id: f.properties.place_id,
          }));
          setSuggestions(results);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [center],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && !disabled) {
        fetchSuggestions(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions, disabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (s: Suggestion) => {
    setQuery(s.formatted);
    setShowDropdown(false);
    onSelect({
      address: s.formatted,
      lat: s.lat,
      lng: s.lon,
      district: s.district || "",
    });
  };

  return (
    <div className="mb-4" style={{ position: "relative" }} ref={dropdownRef}>
      <label className="form-label fw-semibold text-dark small mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="input-group">
        <span className="input-group-text bg-light text-secondary border-end-0 px-3">
          {isLoading ? <FiLoader className="spin-animation" /> : <FiSearch />}
        </span>
        <input
          type="text"
          className={`form-control border-start-0 px-2 ${error ? "is-invalid border-danger" : ""}`}
          style={{ boxShadow: "none" }}
          placeholder={
            disabled
              ? `Select a district first`
              : `Search location in ${districtName}...`
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          disabled={disabled}
        />
        {error && <div className="invalid-feedback d-block mt-1">{error}</div>}
        {!error && helperText && (
          <div className="form-text mt-1 small text-muted">{helperText}</div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            marginTop: -1,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((s) => (
            <div
              key={s.place_id}
              onClick={() => handleSelect(s)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                borderBottom: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f8fafc")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#fff")
              }
            >
              <FiMapPin style={{ color: "#64748b", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#1e293b" }}>
                {s.formatted}
              </span>
            </div>
          ))}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin-animation { animation: spin 1s linear infinite; }
            `,
        }}
      />
    </div>
  );
};
