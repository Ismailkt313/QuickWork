import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  RiStarFill, 
  RiStarLine, 
  RiCloseLine, 
  RiChat3Line, 
  RiImageAddLine, 
  RiDeleteBin7Line, 
  RiLoader4Line,
  RiFeedbackLine
} from "react-icons/ri";
import { cloudinaryService } from "../../../services/cloudinaryService";
import { toast } from "react-toastify";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, images: string[]) => Promise<void>;
  providerName: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  providerName,
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
          toast.error("Maximum 5 images allowed");
          break;
        }
        const result = await cloudinaryService.uploadImage(files[i], "quickwork/reviews");
        newImages.push(result.secure_url);
      }
      setImages(newImages);
    } catch {
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
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="qw-modal-overlay" onClick={onClose}>
      <div className="qw-modal-content animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="qw-modal-header mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="qw-header-icon-box review">
              <RiFeedbackLine size={24} />
            </div>
            <div className="flex-grow-1">
              <h4 className="qw-modal-title">Review Provider</h4>
              <p className="qw-modal-subtitle">Experience with {providerName}</p>
            </div>
            <button className="qw-modal-close-btn" onClick={onClose}>
              <RiCloseLine size={24} />
            </button>
          </div>
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
            <label className="qw-field-label">
              <RiChat3Line /> Your Feedback
            </label>
            <textarea
              className="qw-textarea"
              rows={4}
              placeholder="Tell us what you liked or what could be improved..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="qw-field-label d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center gap-2">
                <RiImageAddLine /> Project Images
              </span>
              <span className="count">{images.length}/5</span>
            </label>
            <div className="qw-image-upload-grid">
              {images.map((img, index) => (
                <div key={index} className="qw-uploaded-image">
                  <img src={img} alt="review" />
                  <button type="button" className="qw-img-remove" onClick={() => removeImage(index)}>
                    <RiDeleteBin7Line />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  className="qw-img-add-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <RiLoader4Line className="qw-spin" size={24} />
                  ) : (
                    <>
                      <RiImageAddLine size={24} />
                      <span>Add</span>
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
          </div>

          <button
            type="submit"
            className="qw-modal-submit-btn primary"
            disabled={!rating || loading || uploading}
          >
            {loading ? <RiLoader4Line className="qw-spin" /> : "Submit Review"}
          </button>
        </form>
      </div>

      <style>{`
        .qw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 999999;
          overflow-y: auto;
        }

        .qw-modal-content {
          background: #fff;
          width: 100%;
          max-width: 500px;
          padding: 40px;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          position: relative;
          margin: auto;
          max-height: 90vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .qw-modal-content::-webkit-scrollbar { width: 6px; }
        .qw-modal-content::-webkit-scrollbar-track { background: transparent; }
        .qw-modal-content::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .qw-modal-content::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }

        .qw-modal-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 22px;
          margin: 0;
          color: #0f172a;
        }

        .qw-modal-subtitle {
          color: #64748b;
          font-size: 13px;
          margin: 2px 0 0;
        }

        .qw-header-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qw-header-icon-box.review { background: #eff6ff; color: #3b82f6; }
        .qw-header-icon-box.report { background: #fef2f2; color: #ef4444; }

        .qw-modal-close-btn {
          border: none;
          background: #f8fafc;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .qw-modal-close-btn:hover { background: #f1f5f9; color: #0f172a; }

        .star-button { transition: transform 0.2s; }
        .star-button:hover { transform: scale(1.1); }

        .qw-field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 12px;
        }

        .qw-field-label .count { color: #94a3b8; font-variant-numeric: tabular-nums; }

        .qw-textarea {
          width: 100%;
          border-radius: 18px;
          padding: 16px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          transition: all 0.2s;
          resize: none;
        }

        .qw-textarea:focus {
          outline: none;
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .qw-image-upload-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .qw-uploaded-image {
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          border: 1px solid #e2e8f0;
        }

        .qw-uploaded-image img { width: 100%; height: 100%; object-fit: cover; }

        .qw-img-remove {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #ef4444;
          color: #fff;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 6px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qw-img-add-btn {
          aspect-ratio: 1;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          color: #94a3b8;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s;
        }

        .qw-img-add-btn:hover { border-color: #6366f1; color: #6366f1; background: #eff6ff; }
        .qw-img-add-btn span { font-size: 10px; font-weight: 700; }

        .qw-modal-submit-btn {
          width: 100%;
          height: 52px;
          border-radius: 16px;
          border: none;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .qw-modal-submit-btn.primary { background: #0f172a; color: #fff; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.15); }
        .qw-modal-submit-btn.danger { background: #ef4444; color: #fff; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.15); }

        .qw-modal-submit-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
        .qw-modal-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .qw-spin { animation: qw-spin 1s linear infinite; }
        @keyframes qw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ReviewModal;
