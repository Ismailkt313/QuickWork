import React, { useState, useRef } from "react";
import {
  RiImageAddLine,
  RiCloseLine,
  RiCheckFill,
  RiInformationLine,
  RiArrowRightLine,
  RiLoader4Line,
} from "react-icons/ri";
import { uploadMultipleImages } from "../services/provider.service";
import { toast } from "react-toastify";

interface SubmitProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { images: string[]; description: string }) => Promise<void>;
  jobTitle?: string;
}

const SubmitProofModal: React.FC<SubmitProofModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  jobTitle = "Job",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
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
    if (!description.trim()) return;
    if (uploadedImages.length === 0) {
      toast.warning("Please upload at least one proof image");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ images: uploadedImages, description });
      onClose();
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit assignment proof");
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
            <div className="p-3 bg-primary-subtle rounded-4 text-primary">
              <RiCheckFill size={24} />
            </div>
            <div>
              <h3
                className="fw-bold text-dark mb-0"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                Mark as Completed
              </h3>
              <p className="text-muted mb-0 small">
                Please provide proof of work for "{jobTitle}"
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
              Proof Images ({uploadedImages.length}/5)
            </label>

            {uploadedImages.length < 5 && (
              <div
                className={`p-4 rounded-5 border-2 border-dashed d-flex flex-column align-items-center justify-content-center transition-all mb-3 ${dragActive ? "border-primary bg-primary-subtle" : "border-light bg-light"}`}
                style={{ cursor: "pointer", minHeight: "140px" }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files) {
                    const event = {
                      target: { files: e.dataTransfer.files },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;
                    handleFileChange(event);
                  }
                }}
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
                    size={32}
                    className="animate-spin text-primary mb-2"
                  />
                ) : (
                  <RiImageAddLine size={32} className="text-primary mb-2" />
                )}
                <p className="fw-bold mb-0 text-dark small">
                  Click or drag photos
                </p>
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {uploadedImages.map((url, index) => (
                  <div
                    key={index}
                    className="position-relative"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <img
                      src={url}
                      alt={`Proof ${index}`}
                      className="w-100 h-100 object-fit-cover rounded-3 border"
                    />
                    <button
                      type="button"
                      className="position-absolute top-0 end-0 bg-danger text-white border-0 rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "20px",
                        height: "20px",
                        marginTop: "-8px",
                        marginRight: "-8px",
                      }}
                      onClick={() => removeImage(url)}
                    >
                      <RiCloseLine size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label
              className="fw-bold text-dark mb-2 small text-uppercase"
              style={{ letterSpacing: "0.05em" }}
            >
              Work Details
            </label>
            <textarea
              className="form-control rounded-4 p-3 border-light bg-light"
              rows={4}
              placeholder="Describe what was done and any relevant notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              style={{ fontSize: "15px", resize: "none" }}
              required
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-4 border border-blue-100 d-flex gap-3 align-items-start mb-4">
            <RiInformationLine
              className="text-blue-500 flex-shrink-0 mt-0-5"
              size={20}
            />
            <p className="small text-blue-800 mb-0" style={{ lineHeight: 1.5 }}>
              Submitting this will notify the client and initiate the payment
              verification process. Ensure all details are accurate.
            </p>
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn-action-primary d-flex align-items-center justify-content-center gap-2"
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? (
                <>
                  <RiLoader4Line className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Complete Task <RiArrowRightLine />
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
          padding: 48px 40px;
          border-radius: 42px;
          box-shadow: 0 30px 60px -12px rgba(15, 23, 42, 0.2);
          position: relative;
        }
        .qw-modal-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qw-modal-close-btn:hover { background: #ef4444; color: white; }
        .btn-action-primary {
          background: #0f172a;
          color: white;
          border: none;
          height: 60px;
          border-radius: 18px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .btn-action-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .bg-blue-50 { background-color: #eff6ff; }
        .border-blue-100 { border-color: #dbeafe; }
        .text-blue-500 { color: #3b82f6; }
        .text-blue-800 { color: #1e40af; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SubmitProofModal;
