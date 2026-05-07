import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  RiErrorWarningLine,
  RiCloseLine,
  RiFileList2Line,
  RiImageAddLine,
  RiDeleteBin7Line,
  RiLoader4Line
} from "react-icons/ri";
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
      toast.error("Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="qw-modal-overlay" onClick={onClose}>
      <div className="qw-modal-content animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <div className="qw-modal-header mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="qw-header-icon-box report">
              <RiErrorWarningLine size={24} />
            </div>
            <div className="flex-grow-1">
              <h4 className="qw-modal-title">Report Issue</h4>
              <p className="qw-modal-subtitle">Reporting: {providerName}</p>
            </div>
            <button className="qw-modal-close-btn" onClick={onClose}>
              <RiCloseLine size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="qw-modal-form">
          <div className="mb-4">
            <label className="qw-field-label">
              <RiErrorWarningLine /> Select Reason
            </label>
            <div className="qw-reason-grid">
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`qw-reason-btn ${reason === r ? "active" : ""}`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="qw-field-label">
              <RiFileList2Line /> Detailed Description
            </label>
            <textarea
              className="qw-textarea"
              rows={4}
              placeholder="Please provide more details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="qw-field-label d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center gap-2">
                <RiImageAddLine /> Evidence / Screenshots
              </span>
              <span className="count">{images.length}/5</span>
            </label>

            <div className="qw-image-upload-grid">
              {images.map((url, index) => (
                <div key={index} className="qw-uploaded-image">
                  <img src={url} alt="Evidence" />
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
                    <RiLoader4Line size={24} className="qw-spin" />
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
              ref={fileInputRef}
              className="d-none"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </div>

          <div className="qw-report-info-banner mb-4">
             <RiErrorWarningLine size={20} className="flex-shrink-0" />
             <p>Our team will review this report and evidence to take appropriate action.</p>
          </div>

          <button
            type="submit"
            className="qw-modal-submit-btn danger"
            disabled={!reason || !description || loading || uploading}
          >
            {loading ? <RiLoader4Line className="qw-spin" /> : "Submit Report"}
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
          max-width: 550px;
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

        .qw-reason-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .qw-reason-btn {
          padding: 12px;
          border-radius: 14px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          line-height: 1.2;
        }

        .qw-reason-btn:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

        .qw-reason-btn.active {
          border-color: #ef4444;
          background: #ef4444;
          color: #fff;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .qw-textarea {
          width: 100%;
          border-radius: 20px;
          padding: 18px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          transition: all 0.2s;
          resize: none;
        }

        .qw-textarea:focus {
          outline: none;
          border-color: #ef4444;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
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
          width: 22px;
          height: 22px;
          border-radius: 8px;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

        .qw-img-add-btn:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        .qw-img-add-btn span { font-size: 10px; font-weight: 700; }

        .qw-report-info-banner {
          display: flex;
          gap: 12px;
          padding: 14px 18px;
          background: #fff7ed;
          border-radius: 16px;
          color: #9a3412;
          border: 1px solid #ffedd5;
        }

        .qw-report-info-banner p { font-size: 12px; margin: 0; line-height: 1.5; font-weight: 500; }

        .qw-modal-submit-btn {
          width: 100%;
          height: 56px;
          border-radius: 18px;
          border: none;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .qw-modal-submit-btn.danger { background: #ef4444; color: #fff; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.15); }
        .qw-modal-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25); filter: brightness(1.05); }
        .qw-modal-submit-btn:active { transform: translateY(0); }
        .qw-modal-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        .qw-spin { animation: qw-spin 1s linear infinite; }
        @keyframes qw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .animate-pop-in { animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ReportIssueModal;
