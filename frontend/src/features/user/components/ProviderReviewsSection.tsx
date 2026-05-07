import React, { useState, useEffect } from "react";
import { RiStarFill, RiTimeLine, RiBriefcaseLine } from "react-icons/ri";
import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";
import { format } from "date-fns";

interface ProviderReview {
  _id: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
  provider: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  assignment: {
    _id: string;
    title: string;
  };
}

interface ProviderReviewsSectionProps {
  userId: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const ProviderReviewsSection: React.FC<ProviderReviewsSectionProps> = ({ userId }) => {
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [meta, setMeta] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get(ENDPOINTS.REVIEW.CLIENT_REVIEWS(userId), {
          params: { page, limit: 5 }
        });
        if (response.data.success) {
          setReviews(response.data.data);
          setMeta(response.data.meta);
          setPagination(response.data.pagination);
        }
      } catch (err) {
        console.error("Failed to fetch provider reviews:", err);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReviews();
    }
  }, [userId, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && page === 1) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
        <div className="spinner-border text-primary mx-auto" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-secondary">Loading provider feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-danger">
        <p>{error}</p>
      </div>
    );
  }

  if (reviews.length === 0 && !loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
        <div className="bg-light rounded-circle p-3 d-inline-flex mb-3 mx-auto" style={{ width: "fit-content" }}>
          <RiStarFill size={32} className="text-secondary opacity-25" />
        </div>
        <h5 className="fw-bold">No provider reviews yet</h5>
        <p className="text-secondary small mb-0">When providers review your work performance, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      <div className="card-header bg-transparent border-bottom p-4 py-3 d-flex align-items-center justify-content-between">
        <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
          <RiStarFill className="text-warning" />
          Provider Feedback
        </h5>
        {meta && (
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">{meta.averageRating.toFixed(1)}</span>
            <div className="d-flex text-warning">
              {[1, 2, 3, 4, 5].map((s) => (
                <RiStarFill key={s} size={14} className={s <= Math.round(meta.averageRating) ? "text-warning" : "text-light"} />
              ))}
            </div>
            <span className="text-secondary small">({meta.totalReviews} reviews)</span>
          </div>
        )}
      </div>
      <div className="card-body p-4">
        <div className="row g-4">
          {reviews.map((review) => (
            <div key={review._id} className="col-12">
              <div className="p-3 rounded-4 bg-light border border-light-subtle h-100 transition-hover">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex text-warning">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <RiStarFill key={s} size={14} className={s <= review.rating ? "text-warning" : "text-secondary opacity-25"} />
                      ))}
                    </div>
                    <span className="fw-bold small">{review.rating.toFixed(1)}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1 text-secondary small">
                    <RiTimeLine size={14} />
                    {format(new Date(review.createdAt), "dd MMM yyyy")}
                  </div>
                </div>

                <p className="text-dark mb-3 font-italic" style={{ fontSize: "14.5px", lineHeight: "1.6" }}>
                  "{review.comment || "No comment provided"}"
                </p>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #a855f7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "bold",
                        overflow: "hidden"
                      }}
                    >
                      {review.provider.profileImage ? (
                        <img src={review.provider.profileImage} alt={review.provider.name} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        review.provider.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="fw-bold text-dark small" style={{ fontSize: "13px" }}>{review.provider.name}</div>
                      <div className="text-secondary" style={{ fontSize: "11px" }}>Provider</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1 bg-white px-2 py-1 rounded-pill border small" style={{ fontSize: "11px" }}>
                    <RiBriefcaseLine size={12} className="text-primary" />
                    <span className="text-dark fw-medium text-truncate" style={{ maxWidth: "120px" }}>{review.assignment.title}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-center gap-3 mt-4 pt-3 border-top">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-bold"
            >
              Previous
            </button>
            <span className="text-secondary small fw-bold">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNext || loading}
              className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fw-bold"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>{`
        .transition-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #dee2e6 !important;
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ProviderReviewsSection;
