import React, { useState, useRef } from "react";
import { RiStarFill, RiStarLine, RiCloseLine, RiChat3Line, RiImageAddLine, RiDeleteBin7Line, RiLoader4Line } from "react-icons/ri";
import { cloudinaryService } from "../../../services/cloudinaryService";
import { toast } from "react-toastify";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, images: string[]) => Promise<void>;
  clientName: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clientName,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= 5) {
          toast.warning("Maximum 5 images allowed");
          break;
        }
        const result = await cloudinaryService.uploadImage(files[i], "quickwork/reviews");
        newImages.push(result.secure_url);
      }
      setImages(newImages);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    try {
      setLoading(true);
      await onSubmit(rating, comment, images);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qw-modal-overlay">
      <div className="qw-modal-content premium-review-modal">
        <div className="qw-modal-header d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Review Client</h4>
            <p className="text-muted small mb-0">How was your experience working with {clientName}?</p>
          </div>
          <button className="btn btn-light rounded-circle p-2" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="text-center mb-5">
            <div className="d-flex justify-content-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="btn p-0 star-button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  style={{ transition: "transform 0.2s ease" }}
                >
                  {(hover || rating) >= star ? (
                    <RiStarFill
                      size={48}
                      className={star <= (hover || rating) ? "text-warning" : "text-light"}
                    />
                  ) : (
                    <RiStarLine size={48} className="text-muted opacity-25" />
                  )}
                </button>
              ))}
            </div>
            <div className="rating-text fw-bold text-primary">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
              {!rating && "Select a rating"}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase mb-2">
              <RiChat3Line className="me-2" /> Your Feedback
            </label>
            <textarea
              className="form-control rounded-4 p-3 border-light shadow-sm"
              rows={4}
              placeholder="Describe your experience working with this client..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: "none", backgroundColor: "#f8fafc" }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase mb-2">
              <RiImageAddLine className="me-2" /> Project Images (Optional)
            </label>
            <div className="d-flex flex-wrap gap-3 mb-2">
              {images.map((img, index) => (
                <div key={index} className="position-relative rounded-3 overflow-hidden shadow-sm" style={{ width: 80, height: 80 }}>
                  <img src={img} alt="review" className="w-100 h-100 object-fit-cover" />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 p-1 m-1 rounded-circle"
                    onClick={() => removeImage(index)}
                    style={{ width: 24, height: 24, fontSize: 10 }}
                  >
                    <RiDeleteBin7Line />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  className="btn btn-outline-dashed rounded-3 d-flex flex-column align-items-center justify-content-center gap-1 border-2"
                  style={{ width: 80, height: 80, borderStyle: "dashed" }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <RiLoader4Line className="animate-spin text-primary" size={20} />
                  ) : (
                    <>
                      <RiImageAddLine size={20} />
                      <span style={{ fontSize: 10 }}>Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <p className="text-muted small mb-0">Share images of the completed project or workspace.</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
            disabled={!rating || loading || uploading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      </div>

      <style>{`
        .qw-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          animation: qwFadeIn 0.3s ease;
        }
        .qw-modal-content {
          background: white;
          padding: 2.5rem;
          border-radius: 2rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: qwSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .star-button:hover {
          transform: scale(1.15);
        }
        .rating-text {
          font-size: 1.1rem;
          height: 1.5rem;
        }
        .form-control:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
          background-color: white !important;
        }
        .btn-outline-dashed {
          color: #94a3b8;
          border-color: #e2e8f0;
        }
        .btn-outline-dashed:hover {
          background: #f8fafc;
          border-color: #6366f1;
          color: #6366f1;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes qwFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes qwSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ReviewModal;
