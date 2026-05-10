import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { getProviderById, getProviderReviews } from "../services/providersService";
import { RiStarFill } from "react-icons/ri";
import {
  getLandingData,
  type Location,
} from "../../landingPage/services/landingService";
import { DirectHireModal } from "../../jobs/components/DirectHireModal";

interface ProviderDetail {
  id: string;
  _id: string;
  userId: string;
  headline: string;
  about: string;
  profileImage: string;
  skills: { id?: string; _id?: string; name: string }[];
  yearsOfExperience: number;
  hourlyRate: number;
  location: { id: string; name: string; lat: number; lon: number };
  portfolio: { title: string; description?: string; images: string[] }[];
  createdAt: string;
  availability: { day: string; startTime: string; endTime: string; isAvailable: boolean }[];
  blockedDates: { startDate: string; endDate: string; reason: string }[];
}

interface Review {
  id: string;
  reviewerId: { id: string; name: string; profileImage?: string };
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

const ProviderDetailPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewMeta, setReviewMeta] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviewPagination, setReviewPagination] = useState({ page: 1, totalPages: 1, hasNext: false });


  useEffect(() => {
    getLandingData()
      .then((d) => setLocations(d.locations))
      .catch(() => { });
  }, []);

  const fetchReviews = useCallback((userId: string, page: number = 1) => {
    setLoadingReviews(true);
    getProviderReviews(userId, { page, limit: 5 })
      .then(reviewRes => {
        if (reviewRes.success) {
          if (page === 1) {
            setReviews(reviewRes.data);
          } else {
            setReviews(prev => [...prev, ...reviewRes.data]);
          }
          setReviewMeta(reviewRes.meta);
          setReviewPagination({
            page: reviewRes.pagination.page,
            totalPages: reviewRes.pagination.totalPages,
            hasNext: reviewRes.pagination.hasNext
          });
        }
      })
      .finally(() => setLoadingReviews(false));
  }, []);

  useEffect(() => {
    if (!providerId) return;
    getProviderById<ProviderDetail>(providerId)
      .then((res) => {
        if (res.success) {
          setProvider(res.data);
          if (res.data.userId) {
            fetchReviews(res.data.userId, 1);
          }
        }
        else setError(res.message || "Provider not found");
      })
      .catch(() => setError("Failed to load provider details"))
      .finally(() => setLoading(false));
  }, [providerId, fetchReviews]);

  const handleLoadMoreReviews = () => {
    if (provider?.userId && reviewPagination.hasNext && !loadingReviews) {
      fetchReviews(provider.userId, reviewPagination.page + 1);
    }
  };

  if (loading) {
    return (
      <MainLayout
        locations={locations}
        selectedLocation={null}
        onSelectLocation={() => { }}
        onClearLocation={() => { }}
      >
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: 48, height: 48 }}
          ></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !provider) {
    return (
      <MainLayout
        locations={locations}
        selectedLocation={null}
        onSelectLocation={() => { }}
        onClearLocation={() => { }}
      >
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>😔</div>
          <h3 className="fw-bold" style={{ color: "#1e293b" }}>
            {error || "Provider not found"}
          </h3>
          <button
            onClick={() => navigate(-1)}
            className="btn mt-3"
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              background: "#3b82f6",
              color: "#fff",
              fontWeight: 600,
              border: "none",
            }}
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  const joinedDate = new Date(provider.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <MainLayout
      locations={locations}
      selectedLocation={null}
      onSelectLocation={() => { }}
      onClearLocation={() => { }}
    >
      <>
        <style>{`
        .provider-detail-hero {
          background: linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
          padding: 32px 0 80px;
        }
        .profile-container-mobile {
          margin-top: -60px;
          padding: 16px;
        }
        .mobile-hero-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }
        .mobile-avatar-row {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 16px;
        }
        .mobile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          object-fit: cover;
          border: 3px solid #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .mobile-hero-info h2 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .mobile-rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #fef3c7;
          color: #92400e;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }
        .mobile-actions-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 24px;
        }
        .mobile-action-btn {
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          border: none;
          transition: all 0.2s;
        }
        .btn-primary-mobile {
          background: linear-gradient(135deg,#3b82f6,#2563eb);
          color: #fff;
          box-shadow: 0 4px 12px rgba(37,99,235,0.2);
        }
        .btn-secondary-mobile {
          background: #fff;
          border: 1.5px solid #e2e8f0 !important;
          color: #1e293b;
        }
        .mobile-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        .mobile-stat-card {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          padding: 12px;
          border-radius: 14px;
          text-align: center;
        }
        .mobile-stat-value {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          display: block;
        }
        .mobile-stat-label {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .mobile-section {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }
        .mobile-section-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .skill-chip-mobile {
          display: inline-block;
          padding: 6px 12px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 6px;
          margin-bottom: 6px;
        }
        .portfolio-grid-mobile {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .portfolio-item-mobile {
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          background: #f1f5f9;
        }
        .availability-chip {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 10px;
          margin-bottom: 6px;
          font-size: 13px;
        }
        .review-card-mobile {
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .review-header-mobile {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
      `}</style>

      <div className="provider-detail-hero">
        <div className="container">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span
              onClick={() => navigate("/")}
              style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }}
            >
              Home
            </span>
            <span style={{ color: "#475569", fontSize: 13 }}>/</span>
            <span
              onClick={() => navigate(-1)}
              style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }}
            >
              Providers
            </span>
            <span style={{ color: "#475569", fontSize: 13 }}>/</span>
            <span style={{ color: "#e2e8f0", fontSize: 13 }}>
              {provider.headline}
            </span>
          </div>
        </div>
      </div>
      <div
        className="container"
        style={{
          marginTop: -60,
          position: "relative",
          zIndex: 5,
          paddingBottom: 64,
        }}
      >
        <div className="row g-4">
          <div className="col-lg-4">
            <div
              className="card border-0 rounded-4 overflow-hidden"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
            >
              <div
                style={{
                  height: 280,
                  overflow: "hidden",
                  background: "#f1f5f9",
                }}
              >
                <img
                  src={provider.profileImage}
                  alt={provider.headline}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.headline)}&size=400&background=3b82f6&color=fff`;
                  }}
                />
              </div>
              <div className="card-body p-4">
                <h4
                  className="fw-bold mb-1"
                  style={{ color: "#0f172a", fontSize: 20 }}
                >
                  {provider.headline}
                </h4>
                {reviewMeta.totalReviews > 0 && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="d-flex text-warning">
                      {[...Array(5)].map((_, i) => (
                        <RiStarFill key={i} size={14} color={i < Math.floor(reviewMeta.averageRating) ? "#f59e0b" : "#e2e8f0"} />
                      ))}
                    </div>
                    <span className="fw-bold text-dark small">{reviewMeta.averageRating}</span>
                    <span className="text-muted small">({reviewMeta.totalReviews} reviews)</span>
                  </div>
                )}
                <div className="d-flex align-items-center gap-2 mb-3 mt-2">
                  <span style={{ fontSize: 14, color: "#64748b" }}>
                    📍 {provider.location.name}
                  </span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>•</span>
                  <span style={{ fontSize: 14, color: "#64748b" }}>
                    Joined {joinedDate}
                  </span>
                </div>

                <div
                  className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3"
                  style={{ background: "#f8fafc" }}
                >
                  <div className="text-center flex-fill">
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      ₹{provider.hourlyRate}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      per hour
                    </div>
                  </div>
                  <div
                    style={{ width: 1, height: 36, background: "#e2e8f0" }}
                  ></div>
                  <div className="text-center flex-fill">
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {provider.yearsOfExperience}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      yrs experience
                    </div>
                  </div>
                  <div
                    style={{ width: 1, height: 36, background: "#e2e8f0" }}
                  ></div>
                  <div className="text-center flex-fill">
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      ✓
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      Verified
                    </div>
                  </div>
                </div>

                <button
                  className="btn w-100 mb-2"
                  onClick={() => setIsHireModalOpen(true)}
                  style={{
                    padding: "12px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                    border: "none",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(59,130,246,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  ⚡ Direct Hire
                </button>
                <button
                  className="btn w-100"
                  onClick={() =>
                    navigate(
                      `/user/messages?userId=${provider.userId}&name=${encodeURIComponent(provider.headline)}`,
                    )
                  }
                  style={{
                    padding: "12px",
                    borderRadius: 12,
                    background: "#fff",
                    border: "1.5px solid #e2e8f0",
                    color: "#1e293b",
                    fontSize: 15,
                    fontWeight: 700,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.color = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.color = "#1e293b";
                  }}
                >
                  💬 Message Provider
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div
              className="card border-0 rounded-4 p-4 mb-4"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <h5
                className="fw-bold mb-3"
                style={{ color: "#0f172a", fontSize: 18 }}
              >
                About
              </h5>
              <p
                style={{
                  color: "#475569",
                  fontSize: 14.5,
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  margin: 0,
                }}
              >
                {provider.about}
              </p>
            </div>

            <div
              className="card border-0 rounded-4 p-4 mb-4"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <h5
                className="fw-bold mb-3"
                style={{ color: "#0f172a", fontSize: 18 }}
              >
                Skills
              </h5>
              <div className="d-flex flex-wrap gap-2">
                {provider.skills.map((skill) => (
                  <span
                    key={skill._id}
                    onClick={() =>
                      navigate(
                        `/user/services/${skill._id}?name=${encodeURIComponent(skill.name)}`,
                      )
                    }
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      background: "#eff6ff",
                      color: "#2563eb",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textTransform: "capitalize",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#dbeafe";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#eff6ff";
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>

            {}
            <div
              className="card border-0 rounded-4 p-4 mb-4"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              <h5 className="fw-bold mb-4" style={{ color: "#0f172a", fontSize: 18 }}>
                Availability & Schedule
              </h5>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <h6 className="fw-bold mb-3" style={{ fontSize: 14, color: "#1e293b" }}>Weekly Hours</h6>
                    <div className="d-flex flex-column gap-2">
                      {provider.availability?.length > 0 ? (
                        provider.availability.map((a, idx) => (
                          <div key={idx} className="d-flex justify-content-between align-items-center">
                            <span className="text-capitalize" style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{a.day}</span>
                            {a.isAvailable ? (
                              <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{a.startTime} - {a.endTime}</span>
                            ) : (
                              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>Unavailable</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small m-0">Standard business hours (09:00 - 18:00)</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 rounded-3" style={{ background: "#fef2f2", border: "1px solid #fee2e2" }}>
                    <h6 className="fw-bold mb-3" style={{ fontSize: 14, color: "#991b1b" }}>Upcoming Leave / Blocked Dates</h6>
                    <div className="d-flex flex-column gap-2">
                      {provider.blockedDates?.filter(b => new Date(b.endDate) >= new Date(new Date().setHours(0,0,0,0))).length > 0 ? (
                        provider.blockedDates
                          .filter(b => new Date(b.endDate) >= new Date(new Date().setHours(0,0,0,0)))
                          .map((b, idx) => (
                          <div key={idx} className="p-2 rounded-2" style={{ background: "#fff", border: "1px solid #fecdd3" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{b.reason}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>
                              {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small m-0" style={{ color: "#b91c1c" }}>No upcoming leave scheduled.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {provider.portfolio.length > 0 && (
              <div
                className="card border-0 rounded-4 p-4"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
              >
                <h5
                  className="fw-bold mb-3"
                  style={{ color: "#0f172a", fontSize: 18 }}
                >
                  Portfolio ({provider.portfolio.length}{" "}
                  {provider.portfolio.length === 1 ? "project" : "projects"})
                </h5>
                {provider.portfolio.map((project, idx) => (
                  <div
                    key={idx}
                    className={idx > 0 ? "mt-4 pt-4" : ""}
                    style={idx > 0 ? { borderTop: "1px solid #f1f5f9" } : {}}
                  >
                    <h6
                      className="fw-bold mb-1"
                      style={{ color: "#1e293b", fontSize: 15 }}
                    >
                      {project.title}
                    </h6>
                    {project.description && (
                      <p
                        style={{
                          color: "#64748b",
                          fontSize: 13.5,
                          marginBottom: 12,
                        }}
                      >
                        {project.description}
                      </p>
                    )}
                    <div className="d-flex flex-wrap gap-2">
                      {project.images.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          onClick={() => setLightbox(img)}
                          style={{
                            width: 120,
                            height: 90,
                            borderRadius: 10,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "transform 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <img
                            src={img}
                            alt={project.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {}
            <div id="reviews-section" className="card border-0 rounded-4 p-4 mt-4 mb-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="fw-bold m-0" style={{ color: "#0f172a", fontSize: 18 }}>
                  Client Reviews ({reviewMeta.totalReviews})
                </h5>
                {reviewMeta.totalReviews > 0 && (
                  <div className="d-flex align-items-center gap-2 bg-warning-subtle px-3 py-1 rounded-pill">
                    <RiStarFill className="text-warning" size={18} />
                    <span className="fw-bold" style={{ color: "#854d0e" }}>
                      {reviewMeta.averageRating} / 5.0
                    </span>
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="d-flex flex-column gap-4">
                  {reviews.map((review, idx) => (
                    <div
                      key={review.id}
                      className={idx === reviews.length - 1 && !reviewPagination.hasNext ? "" : "pb-4 mb-2"}
                      style={idx === reviews.length - 1 && !reviewPagination.hasNext ? {} : { borderBottom: "1px solid #f1f5f9" }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                            style={{
                              width: 44,
                              height: 44,
                              background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                              color: "#6366f1",
                              fontSize: 15,
                              border: "2px solid #fff"
                            }}
                          >
                            {review.reviewerId.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: 14.5 }}>{review.reviewerId.name}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>{new Date(review.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="d-flex gap-1 text-warning">
                          {[...Array(5)].map((_, i) => (
                            <RiStarFill
                              key={i}
                              size={16}
                              style={{ color: i < review.rating ? "#f59e0b" : "#e2e8f0" }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-dark mb-3" style={{ fontSize: 14, lineHeight: 1.6, color: "#334155" }}>{review.comment}</p>
                      {review.images && review.images.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {review.images.map((img, i) => (
                            <div
                              key={i}
                              className="rounded-3 overflow-hidden border shadow-sm"
                              style={{ width: 70, height: 70, cursor: 'pointer', transition: 'transform 0.2s' }}
                              onClick={() => setLightbox(img)}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              <img src={img} alt="review" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {reviewPagination.hasNext && (
                    <div className="text-center mt-2">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold"
                        onClick={handleLoadMoreReviews}
                        disabled={loadingReviews}
                      >
                        {loadingReviews ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Loading...
                          </>
                        ) : (
                          "Load More Reviews"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : loadingReviews ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary"></div>
                  <p className="mt-2 text-muted small">Loading reviews...</p>
                </div>
              ) : (
                <div className="text-center py-5 rounded-4" style={{ background: "#f8fafc", border: "1px dashed #e2e8f0" }}>
                  <div className="text-muted mb-2" style={{ fontSize: 32 }}>⭐</div>
                  <p className="mb-0 text-muted small fw-medium">No reviews yet for this provider.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            animation: "qwFadeIn 0.18s ease",
          }}
        >
          <img
            src={lightbox}
            alt="Full preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              borderRadius: 12,
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: 10,
              width: 40,
              height: 40,
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      <DirectHireModal
        isOpen={isHireModalOpen}
        onClose={() => setIsHireModalOpen(false)}
        providerId={provider._id || provider.id}
        providerName={provider.headline}
        providerSkills={provider.skills}
        availability={provider.availability}
        blockedDates={provider.blockedDates}
      />
      </>
    </MainLayout>
  );
};

export default ProviderDetailPage;
