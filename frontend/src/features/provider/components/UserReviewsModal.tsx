import React, { useCallback, useEffect, useState } from "react";
import { RiCloseLine, RiStarFill, RiStarLine, RiLoader4Line, RiChat3Line, RiCalendarLine } from "react-icons/ri";
import { getReviewsForUser } from "../services/provider.service";

interface Review {
  id: string;
  reviewerId: { id: string; name: string };
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

interface UserReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

const UserReviewsModal: React.FC<UserReviewsModalProps> = ({ isOpen, onClose, userId, userName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ averageRating: 0, totalReviews: 0 });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getReviewsForUser(userId, 1, 100);
      if (res.success) {
        setReviews(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error("Failed to fetch user reviews", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchReviews();
    }
  }, [isOpen, userId, fetchReviews]);

  if (!isOpen) return null;

  return (
    <div className="qw-modal-overlay">
      <div className="qw-modal-content premium-reviews-modal" style={{ maxWidth: 600 }}>
        <div className="qw-modal-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Reviews for {userName}</h4>
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex text-warning">
                {[...Array(5)].map((_, i) => (
                  i < Math.round(meta.averageRating) ? <RiStarFill key={i} /> : <RiStarLine key={i} />
                ))}
              </div>
              <span className="fw-bold text-dark">{meta.averageRating.toFixed(1)}</span>
              <span className="text-muted small">({meta.totalReviews} reviews)</span>
            </div>
          </div>
          <button className="btn btn-light rounded-circle p-2" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="reviews-list" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 8 }}>
          {loading ? (
            <div className="text-center py-5">
              <RiLoader4Line size={40} className="qw-spin text-primary" />
              <p className="mt-2 text-muted fw-medium">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4 border border-dashed">
              <RiChat3Line size={48} className="text-muted opacity-25 mb-3" />
              <p className="text-muted fw-medium mb-0">No reviews yet for this user.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 rounded-4 border border-f1f5f9 shadow-sm bg-white hover-shadow-md transition-all">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {review.reviewerId.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold text-dark small">{review.reviewerId.name}</div>
                        <div className="text-muted small d-flex align-items-center gap-1">
                          <RiCalendarLine size={12} /> {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex text-warning">
                      {[...Array(5)].map((_, i) => (
                        i < review.rating ? <RiStarFill key={i} size={14} /> : <RiStarLine key={i} size={14} />
                      ))}
                    </div>
                  </div>
                  <p className="text-dark mb-2" style={{ fontSize: 14, lineHeight: 1.6 }}>{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="d-flex gap-2 overflow-auto pb-2 qw-mini-images">
                      {review.images.map((img, i) => (
                        <img key={i} src={img} alt="review" className="rounded-3 shadow-sm border" style={{ width: 60, height: 60, objectFit: 'cover', flexShrink: 0 }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          .qw-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1300; animation: qwFadeIn 0.3s ease; }
          .qw-modal-content { background: white; padding: 2rem; border-radius: 1.5rem; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: qwSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          .qw-spin { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes qwFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes qwSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .hover-shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .reviews-list::-webkit-scrollbar { width: 6px; }
          .reviews-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>
      </div>
    </div>
  );
};

export default UserReviewsModal;
