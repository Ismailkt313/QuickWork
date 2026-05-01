import React, { useEffect, useState } from "react";
import { 
  RiStarFill, 
  RiChatQuoteLine, 
  RiTimeLine, 
  RiUser3Line,
  RiSearchLine,
  RiFilter3Line,
  RiArrowRightSLine
} from "react-icons/ri";
import { reviewService, type Review } from "../services/review.service";
import { toast } from "react-toastify";
import { format } from "date-fns";

const ProviderReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | "all">("all");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getMyReviews();
        setReviews(data);
      } catch (error) {
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.reviewerId.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || "");
    const matchesRating = filterRating === "all" || review.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: reviews.filter(rev => rev.rating === r).length,
    percentage: reviews.length > 0 ? (reviews.filter(rev => rev.rating === r).length / reviews.length) * 100 : 0
  }));

  return (
    <div className="qw-reviews-container animate-fade-in">
      <div className="qw-page-header mb-5">
        <div>
          <h1 className="qw-main-title">Client Feedback</h1>
          <p className="qw-subtitle">Manage and respond to reviews from your clients</p>
        </div>
        <div className="qw-header-stats">
          <div className="qw-stat-pill">
            <RiStarFill className="text-warning" size={20} />
            <span className="value">{averageRating}</span>
            <span className="label">Avg. Rating</span>
          </div>
          <div className="qw-stat-pill">
            <RiChatQuoteLine className="text-primary" size={20} />
            <span className="value">{reviews.length}</span>
            <span className="label">Total Reviews</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="qw-rating-card sticky-top" style={{ top: "2rem" }}>
            <h5 className="fw-bold mb-4">Rating Summary</h5>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="display-4 fw-bold text-dark">{averageRating}</div>
              <div>
                <div className="d-flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <RiStarFill key={s} className={s <= Math.round(Number(averageRating)) ? "text-warning" : "text-light"} size={18} />
                  ))}
                </div>
                <div className="small text-muted">Based on {reviews.length} reviews</div>
              </div>
            </div>

            <div className="qw-rating-bars">
              {ratingCounts.map(item => (
                <div key={item.rating} className="qw-rating-row mb-3">
                  <div className="qw-rating-label">
                    <span>{item.rating}</span>
                    <RiStarFill size={14} className="text-warning" />
                  </div>
                  <div className="qw-progress-container">
                    <div className="qw-progress-bar" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                  <div className="qw-rating-count text-muted small">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="qw-filter-bar mb-4">
            <div className="qw-search-input">
              <RiSearchLine className="icon" />
              <input 
                type="text" 
                placeholder="Search reviews or clients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="qw-filter-select">
              <RiFilter3Line className="icon" />
              <select value={filterRating} onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}>
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="qw-loading-state">
              <div className="spinner-border text-primary" role="status"></div>
              <p>Loading your feedback...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="qw-empty-state">
              <div className="qw-empty-icon">
                <RiChatQuoteLine size={48} />
              </div>
              <h4>No reviews found</h4>
              <p>When clients leave feedback, it will appear here.</p>
            </div>
          ) : (
            <div className="qw-reviews-list">
              {filteredReviews.map((review) => (
                <div key={review.id} className="qw-review-card mb-4 animate-slide-up">
                  <div className="qw-review-header">
                    <div className="qw-reviewer-info">
                      <div className="qw-reviewer-avatar">
                        <RiUser3Line size={20} />
                      </div>
                      <div>
                        <h6 className="mb-0">{review.reviewerId.name}</h6>
                        <div className="qw-review-meta">
                          <RiTimeLine size={12} />
                          <span>{format(new Date(review.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="qw-rating-badges">
                      <div className="qw-star-badge">
                        <RiStarFill size={14} className="text-warning" />
                        <span>{review.rating}.0</span>
                      </div>
                    </div>
                  </div>

                  <div className="qw-review-body mt-3">
                    <p className="qw-comment">{review.comment || "No comment provided."}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="qw-review-images mt-3">
                        {review.images.map((img, idx) => (
                          <div key={idx} className="qw-review-image-item">
                            <img src={img} alt={`Review evidence ${idx + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="qw-review-footer mt-4">
                    <div className="qw-review-actions-left">
                      <div className="qw-assignment-pill" title="Click to copy assignment ID" onClick={() => {
                        navigator.clipboard.writeText(review.assignmentId);
                        toast.success("Assignment ID copied!");
                      }}>
                        <span className="label">Assignment ID</span>
                        <span className="value">#{review.assignmentId.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="qw-review-actions-right">
                       <button className="qw-btn-action-text" onClick={() => window.location.href = `/provider/assignment/${review.assignmentId}`}>
                         View Assignment Details
                         <RiArrowRightSLine />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .qw-reviews-container {
          font-family: 'Inter', sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem;
          color: #1e293b;
        }

        .qw-main-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 2.75rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .qw-subtitle {
          color: #64748b;
          font-size: 1.15rem;
          font-weight: 500;
        }

        .qw-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1.5px solid #f1f5f9;
          padding-bottom: 2.5rem;
        }

        .qw-header-stats {
          display: flex;
          gap: 1.25rem;
        }

        .qw-stat-pill {
          background: #fff;
          border: 1.5px solid #f1f5f9;
          padding: 0.85rem 1.5rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s;
        }

        .qw-stat-pill:hover { transform: translateY(-2px); }

        .qw-stat-pill .value {
          font-weight: 800;
          font-size: 1.5rem;
          color: #0f172a;
          font-family: 'Syne', sans-serif;
        }

        .qw-stat-pill .label {
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .qw-rating-card {
          background: #fff;
          border-radius: 32px;
          padding: 2.5rem;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
        }

        .qw-progress-container {
          flex: 1;
          height: 10px;
          background: #f8fafc;
          border-radius: 100px;
          overflow: hidden;
        }

        .qw-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          border-radius: 100px;
          transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .qw-rating-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .qw-rating-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          width: 3rem;
          font-weight: 800;
          color: #0f172a;
          font-size: 1.1rem;
        }

        .qw-rating-count {
          width: 2.5rem;
          text-align: right;
          font-weight: 600;
          color: #64748b;
        }

        .qw-filter-bar {
          display: flex;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-radius: 24px;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
        }

        .qw-search-input {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .qw-search-input .icon {
          position: absolute;
          left: 1.25rem;
          color: #94a3b8;
          font-size: 1.2rem;
        }

        .qw-search-input input {
          width: 100%;
          padding: 0.75rem 1.25rem 0.75rem 3rem;
          border: 1.5px solid #f1f5f9;
          border-radius: 16px;
          font-size: 1rem;
          transition: all 0.2s;
          font-weight: 500;
        }

        .qw-search-input input:focus {
          outline: none;
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.08);
        }

        .qw-filter-select {
          position: relative;
          display: flex;
          align-items: center;
        }

        .qw-filter-select .icon {
          position: absolute;
          left: 1.25rem;
          color: #94a3b8;
        }

        .qw-filter-select select {
          padding: 0.75rem 2.5rem 0.75rem 3rem;
          border: 1.5px solid #f1f5f9;
          border-radius: 16px;
          background: #fff;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          appearance: none;
          transition: all 0.2s;
        }

        .qw-filter-select select:hover { border-color: #cbd5e1; }

        .qw-review-card {
          background: #fff;
          border-radius: 28px;
          padding: 2rem;
          border: 1.5px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }

        .qw-review-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.06);
          border-color: #e2e8f0;
        }

        .qw-review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .qw-reviewer-info {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .qw-reviewer-avatar {
          width: 56px;
          height: 56px;
          background: #eff6ff;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          font-weight: 800;
          border: 1px solid #dbeafe;
        }

        .qw-reviewer-info h6 {
          font-weight: 700;
          font-size: 1.1rem;
          color: #0f172a;
          margin: 0;
        }

        .qw-review-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .qw-star-badge {
          background: #fefce8;
          color: #854d0e;
          padding: 0.5rem 1rem;
          border-radius: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1.5px solid #fef08a;
          font-family: 'Syne', sans-serif;
        }

        .qw-comment {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #475569;
          margin: 0;
          font-weight: 500;
        }

        .qw-review-images {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .qw-review-image-item {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid #f1f5f9;
          cursor: zoom-in;
          transition: transform 0.2s;
        }

        .qw-review-image-item:hover { transform: scale(1.05); }

        .qw-review-image-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qw-review-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1.5px solid #f8fafc;
        }

        .qw-assignment-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8fafc;
          padding: 0.4rem 0.85rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-assignment-pill:hover { background: #f1f5f9; border-color: #cbd5e1; }

        .qw-assignment-pill .label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .qw-assignment-pill .value {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          font-family: monospace;
        }

        .qw-btn-action-text {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #6366f1;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.5rem;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .qw-btn-action-text:hover { background: #f5f3ff; color: #4f46e5; }

        .qw-loading-state, .qw-empty-state {
          text-align: center;
          padding: 6rem 2rem;
          background: #fff;
          border-radius: 32px;
          border: 2px dashed #e2e8f0;
          color: #64748b;
        }

        .qw-empty-icon {
          color: #cbd5e1;
          margin-bottom: 2rem;
        }

        .spinner-border { width: 3rem; height: 3rem; border-width: 0.25rem; margin-bottom: 1.5rem; }

        .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 992px) {
          .qw-rating-card { margin-bottom: 2rem; position: static !important; }
        }

        @media (max-width: 768px) {
          .qw-page-header { flex-direction: column; align-items: flex-start; gap: 2rem; }
          .qw-header-stats { width: 100%; flex-direction: column; }
          .qw-stat-pill { width: 100%; justify-content: space-between; }
          .qw-filter-bar { flex-direction: column; }
          .qw-review-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .qw-star-badge { align-self: flex-start; }
          .qw-review-footer { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default ProviderReviewsPage;
