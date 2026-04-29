import React, { useState, useRef } from "react";
import { RiErrorWarningLine, RiCloseLine, RiFileList2Line, RiImageAddLine, RiDeleteBin7Line, RiLoader4Line } from "react-icons/ri";
import { cloudinaryService } from "../../../services/cloudinaryService";
import { toast } from "react-toastify";

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string, images: string[]) => Promise<void>;
  providerName: string;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  providerName,
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const reasons = [
    "Poor Work Quality",
    "Incomplete Work",
    "Unprofessional Behavior",
    "Late Completion",
    "Communication Issues",
    "Other",
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.warning("You can only upload up to 5 images");
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map((file) => cloudinaryService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.map(res => res.secure_url);
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success("Images uploaded successfully");
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !description) return;
    try {
      setLoading(true);
      await onSubmit(reason, description, images);
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qw-modal-overlay">
      <div className="qw-modal-content premium-report-modal">
        <div className="qw-modal-header d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-danger-subtle p-2 rounded-3 text-danger">
              <RiErrorWarningLine size={24} />
            </div>
            <div>
              <h4 className="fw-bold mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Report Issue</h4>
              <p className="text-muted small mb-0">Reporting: {providerName}</p>
            </div>
          </div>
          <button className="btn btn-light rounded-circle p-2" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase mb-2">Select Reason</label>
            <div className="d-flex flex-wrap gap-2">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-2 border transition-all ${
                    reason === r
                      ? "btn-danger border-danger fw-bold"
                      : "btn-outline-secondary text-muted bg-light"
                  }`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase mb-2">
              <RiFileList2Line className="me-2" /> Detailed Description
            </label>
            <textarea
              className="form-control rounded-4 p-3 border-light shadow-sm"
              rows={4}
              placeholder="Please provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "none", backgroundColor: "#f8fafc" }}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold small text-uppercase mb-2 d-flex justify-content-between align-items-center">
              Evidence / Screenshots (Optional)
              <span className="text-muted" style={{ fontSize: "10px" }}>{images.length}/5</span>
            </label>
            
            <div className="d-flex flex-wrap gap-2 mb-2">
              {images.map((url, index) => (
                <div key={index} className="position-relative" style={{ width: "80px", height: "80px" }}>
                  <img src={url} alt="Evidence" className="w-100 h-100 object-fit-cover rounded-3 border" />
                  <button
                    type="button"
                    className="position-absolute top-0 end-0 bg-danger text-white border-0 rounded-circle p-1 m-1 shadow-sm"
                    onClick={() => removeImage(index)}
                    style={{ lineHeight: 1 }}
                  >
                    <RiDeleteBin7Line size={12} />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <button
                  type="button"
                  className="btn btn-outline-dashed d-flex flex-column align-items-center justify-content-center border-2 border-dashed rounded-3 bg-light text-muted transition-all"
                  style={{ width: "80px", height: "80px", borderStyle: "dashed" }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <RiLoader4Line size={24} className="animate-spin" />
                  ) : (
                    <>
                      <RiImageAddLine size={24} />
                      <span style={{ fontSize: "10px" }} className="mt-1">Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="d-none"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </div>

          <div className="alert alert-warning border-0 rounded-4 d-flex gap-3 mb-4" style={{ backgroundColor: "#fffbeb" }}>
             <RiErrorWarningLine size={20} className="text-warning flex-shrink-0" />
             <p className="small text-warning-emphasis mb-0">
               Our team will review this report and evidence to take appropriate action.
             </p>
          </div>

          <button
            type="submit"
            className="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
            disabled={!reason || !description || loading || uploading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              "Submit Report"
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
          z-index: 5000;
        }
        .qw-modal-content {
          background: white;
          padding: 2.5rem;
          border-radius: 2rem;
          width: 100%;
          max-width: 550px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .form-control:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          background-color: white !important;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReportIssueModal;
