import React from "react";
import { useNavigate } from "react-router-dom";
import type { ProviderItem } from "../../features/user/serviceProviders/services/providersService";
import { RiStarFill, RiMapPin2Line, RiTimeLine } from "react-icons/ri";

interface CompactProviderCardProps {
  provider: ProviderItem;
}

const CompactProviderCard: React.FC<CompactProviderCardProps> = ({ provider }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/user/services/provider/${provider.id}`)}
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #f1f5f9",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      className="compact-provider-card"
    >
      {/* Image Area */}
      <div style={{ position: "relative", height: "130px", overflow: "hidden", background: "#f8fafc" }}>
        <img
          src={provider.profileImage}
          alt={provider.headline}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(provider.headline) +
              "&size=200&background=3b82f6&color=fff";
          }}
        />
        {/* Rating Badge */}
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(4px)",
          padding: "2px 6px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#0f172a"
        }}>
          <RiStarFill color="#f59e0b" size={12} />
          {provider.averageRating || "4.8"}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: "10px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3 style={{ 
          fontSize: "13px", 
          fontWeight: 700, 
          color: "#1e293b", 
          margin: "0 0 4px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: "1.3",
          height: "34px"
        }}>
          {provider.headline}
        </h3>

        {/* Mini Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "10px" }}>
            <RiMapPin2Line size={11} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {provider.location.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748b", fontSize: "10px" }}>
            <RiTimeLine size={11} />
            <span>{provider.yearsOfExperience}y experience</span>
          </div>
        </div>

        {/* Price & Action */}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>₹{provider.hourlyRate}</span>
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>/hr</span>
          </div>
          <div style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "14px"
          }}>
            ›
          </div>
        </div>
      </div>

      <style>{`
        .compact-provider-card:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
};

export default CompactProviderCard;
