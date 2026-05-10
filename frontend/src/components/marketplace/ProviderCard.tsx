import React from "react";
import { useNavigate } from "react-router-dom";
import type { ProviderItem } from "../../features/user/serviceProviders/services/providersService";

interface ProviderCardProps {
  provider: ProviderItem;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const navigate = useNavigate();

  return (
    <div
      className="provider-card-wrapper"
      onClick={() => navigate(`/user/services/provider/${provider.id}`)}
    >
      <div className="provider-card-inner">
        <div className="provider-image-area">
          <img
            src={provider.profileImage}
            alt={provider.headline}
            className="provider-main-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(provider.headline) +
                "&size=400&background=3b82f6&color=fff";
            }}
          />
        </div>
        <div className="provider-info-area">
          <h6 className="provider-headline">{provider.headline}</h6>

          <div className="provider-tags-row">
            <span className="provider-tag tag-exp">
              <span className="tag-icon">🕐</span> {provider.yearsOfExperience}{" "}
              {provider.yearsOfExperience === 1 ? "yr" : "yrs"}
            </span>
            <span className="provider-tag tag-loc">
              <span className="tag-icon">📍</span> {provider.location.name}
            </span>
          </div>

          <div className="provider-footer">
            <div className="provider-price-group">
              <span className="provider-price">₹{provider.hourlyRate}</span>
              <span className="provider-price-unit">/hr</span>
            </div>
            <button className="provider-view-btn">View Profile</button>
          </div>
        </div>
      </div>

      <style>{`
        .provider-card-wrapper {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
        }
        .provider-card-inner {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          transition: inherit;
        }
        .provider-card-wrapper:hover .provider-card-inner {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.12);
          border-color: #dbeafe;
        }
        .provider-image-area {
          height: 220px;
          width: 100%;
          background: #f8fafc;
          overflow: hidden;
          position: relative;
        }
        .provider-main-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .provider-card-wrapper:hover .provider-main-img {
          transform: scale(1.08);
        }
        .provider-info-area {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .provider-headline {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.4;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .provider-tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        .provider-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }
        .tag-exp { background: #f0fdf4; color: #15803d; }
        .tag-loc { background: #eff6ff; color: #1d4ed8; }
        .tag-icon { font-size: 11px; }

        .provider-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        .provider-price {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .provider-price-unit {
          font-size: 13px;
          color: #94a3b8;
          margin-left: 4px;
          font-weight: 500;
        }
        .provider-view-btn {
          padding: 8px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          border: none;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          transition: all 0.2s ease;
        }
        .provider-view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }

        @media (max-width: 991px) {
          .provider-image-area { height: 180px; }
          .provider-headline { font-size: 15px; }
          .provider-price { font-size: 20px; }
        }
      `}</style>
    </div>
  );
};

export default ProviderCard;
