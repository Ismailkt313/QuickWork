import React, { useState, useRef } from "react";
import {
  RiImageAddLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiInformationLine,
} from "react-icons/ri";
import { uploadMultipleImages } from "../services/provider.service";
import { toast } from "react-toastify";
import { ErrorMessages } from "../../../constants/messages/errorMessages";

interface ReportAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (notes: string, evidence: string[]) => Promise<void>;
  providerName?: string;
}

const ReportAbsenceModal: React.FC<ReportAbsenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  providerName = "Provider",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toast.error(ErrorMessages.MAX_IMAGES_EXCEEDED);
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadMultipleImages(files);
      if (response.success) {
        const newUrls = response.data.map((img) => img.imageUrl);
        setUploadedImages((prev) => [...prev, ...newUrls]);
        toast.success(`${files.length} image(s) uploaded`);
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.warning("Please provide a description of the absence");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(notes, uploadedImages);
      onClose();
    } catch (error: any) {
      console.error("Report failed", error);
      toast.error(error.message || ErrorMessages.INTERNAL_SERVER_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="qw-modal-overlay"
      onClick={isSubmitting ? undefined : onClose}
    >
      <div
        className="qw-modal-content animate-pop-in"
        style={{ maxWidth: "540px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="qw-modal-close-btn"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <RiCloseLine size={24} />
        </button>

        <div className="mb-4">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="p-3 bg-warning-subtle rounded-4 text-warning">
              <RiErrorWarningLine size={24} />
            </div>
            <div>
              <h3
                className="fw-bold text-dark mb-0"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Report Absence
              </h3>
              <p className="text-muted mb-0 small">
                Reporting absence for {providerName}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="fw-bold text-dark mb-2 small text-uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Description
            </label>
            <textarea
              className="form-control rounded-4 p-3 border-light bg-light"
              rows={3}
              placeholder="Explain the situation (e.g., provider didn't show up, couldn't be reached)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              style={{ fontSize: "15px", resize: "none" }}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="fw-bold text-dark mb-2 small text-uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Evidence / Photos (Optional - {uploadedImages.length}/5)
            </label>

            <div
              className="p-3 rounded-4 border-2 border-dashed border-light bg-light d-flex flex-column align-items-center justify-content-center mb-3"
              style={{ cursor: "pointer", minHeight: "100px" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                hidden
              />
              {isUploading ? (
                <RiLoader4Line
                  size={24}
                  className="animate-spin text-warning mb-1"
                />
              ) : (
                <RiImageAddLine size={24} className="text-warning mb-1" />
              )}
              <p className="fw-bold mb-0 text-dark small">Upload Evidence</p>
            </div>

            {uploadedImages.length > 0 && (
              <div className="d-flex flex-wrap gap-2">
                {uploadedImages.map((url, index) => (
                  <div
                    key={index}
                    className="position-relative"
                    style={{ width: "60px", height: "60px" }}
                  >
                    <img
                      src={url}
                      alt={`Evidence ${index}`}
                      className="w-100 h-100 object-fit-cover rounded-3 border"
                    />
                    <button
                      type="button"
                      className="position-absolute top-0 end-0 bg-danger text-white border-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "18px",
                        height: "18px",
                        marginTop: "-6px",
                        marginRight: "-6px",
                      }}
                      onClick={() => removeImage(url)}
                    >
                      <RiCloseLine size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-4 border border-amber-100 d-flex gap-3 align-items-start mb-4">
            <RiInformationLine
              className="text-amber-600 flex-shrink-0 mt-0-5"
              size={20}
            />
            <p
              className="small text-amber-900 mb-0"
              style={{ lineHeight: 1.5 }}
            >
              Reporting absence will cancel this assignment and mark the
              provider. Use this if the provider failed to appear as scheduled.
            </p>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn-action-warning d-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting || !notes.trim()}
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="animate-spin" /> Reporting...
                </>
              ) : (
                <>
                  Report Absence <RiArrowRightLine />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .qw-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 5000;
        }
        .qw-modal-content {
          background: #ffffff;
          width: 100%;
          padding: 40px;
          border-radius: 32px;
          box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.2);
          position: relative;
        }
        .qw-modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qw-modal-close-btn:hover { background: #ef4444; color: white; }
        .btn-action-warning {
          background: #f59e0b;
          color: white;
          border: none;
          height: 56px;
          border-radius: 16px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .btn-action-warning:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2); }
        .bg-amber-50 { background-color: #fffbeb; }
        .border-amber-100 { border-color: #fef3c7; }
        .text-amber-600 { color: #d97706; }
        .text-amber-900 { color: #78350f; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ReportAbsenceModal;
