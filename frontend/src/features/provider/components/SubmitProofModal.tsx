import React, { useState, useRef } from "react";
import {
  RiCloseLine,
  RiCheckboxCircleLine,
  RiInformationLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiCameraLine,
  RiDeleteBinLine,
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
    <div className="qw-proof-overlay" onClick={isSubmitting ? undefined : onClose}>
      <div className="qw-proof-modal animate-proof-in" onClick={(e) => e.stopPropagation()}>
        {}
        <div className="qw-proof-header">
          <div className="qw-proof-icon-box">
            <RiCheckboxCircleLine size={24} />
          </div>
          <div className="qw-proof-title-area">
            <h3>Complete Assignment</h3>
            <p>Upload proof for <span>{jobTitle}</span></p>
          </div>
          <button className="qw-proof-close" onClick={onClose} disabled={isSubmitting}>
            <RiCloseLine size={20} />
          </button>
        </div>

        {}
        <div className="qw-proof-body">
          <form id="proof-form" onSubmit={handleSubmit}>
            {}
            <div className="qw-proof-section">
              <label className="qw-section-label">Proof of Work Photos <span>({uploadedImages.length}/5)</span></label>

              <div className="qw-image-grid">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="qw-image-item animate-pop">
                    <img src={url} alt="Proof" />
                    <button type="button" className="qw-image-remove" onClick={() => removeImage(url)}>
                      <RiDeleteBinLine size={14} />
                    </button>
                  </div>
                ))}

                {uploadedImages.length < 5 && (
                  <div
                    className={`qw-upload-box ${dragActive ? 'active' : ''} ${isUploading ? 'loading' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files) {
                        const event = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                        handleFileChange(event);
                      }
                    }}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple hidden />
                    {isUploading ? <RiLoader4Line className="qw-spin" size={24} /> : <RiCameraLine size={24} />}
                    <span>{isUploading ? 'Uploading...' : 'Add Photo'}</span>
                  </div>
                )}
              </div>
              <p className="qw-upload-tip text-muted">Upload up to 5 clear photos of the completed work</p>
            </div>

            {}
            <div className="qw-proof-section">
              <label className="qw-section-label">Work Description</label>
              <textarea
                className="qw-proof-textarea"
                placeholder="Briefly describe the work you completed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {}
            <div className="qw-proof-info">
              <RiInformationLine size={18} />
              <p>Submitting this proof will notify the client and initiate the payment clearance process.</p>
            </div>
          </form>
        </div>

        {}
        <div className="qw-proof-footer">
          <button className="qw-btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button
            type="submit"
            form="proof-form"
            className="qw-btn-submit"
            disabled={isSubmitting || !description.trim() || uploadedImages.length === 0}
          >
            {isSubmitting ? <RiLoader4Line className="qw-spin" /> : <RiArrowRightLine />}
            {isSubmitting ? 'Submitting Proof...' : 'Complete & Finish'}
          </button>
        </div>
      </div>

      <style>{`
        .qw-proof-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 999999;
        }

        .leaflet-container {
          z-index: 0 !important;
        }

        .qw-proof-modal {
          background: #ffffff;
          width: 100%;
          max-width: 580px;
          max-height: 90vh;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          position: relative;
        }

        .qw-proof-header {
          padding: 24px 32px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .qw-proof-icon-box {
          width: 48px;
          height: 48px;
          background: #f0fdf4;
          color: #16a34a;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qw-proof-title-area h3 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          margin: 0;
          color: #0f172a;
        }

        .qw-proof-title-area p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .qw-proof-title-area p span {
          color: #6366f1;
          font-weight: 600;
        }

        .qw-proof-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
          background: #fff;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-proof-close:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fecaca;
        }

        .qw-proof-body {
          padding: 32px;
          overflow-y: auto;
          flex: 1;
        }

        .qw-proof-section {
          margin-bottom: 24px;
        }

        .qw-section-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          margin-bottom: 12px;
        }

        .qw-section-label span {
          color: #6366f1;
        }

        .qw-image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
        }

        .qw-image-item {
          aspect-ratio: 1;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .qw-image-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .qw-image-remove {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 24px;
          height: 24px;
          background: rgba(220, 38, 38, 0.9);
          color: #fff;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.2s;
        }

        .qw-image-item:hover .qw-image-remove {
          opacity: 1;
          transform: translateY(0);
        }

        .qw-upload-box {
          aspect-ratio: 1;
          background: #f8fafc;
          border: 2px dashed #e2e8f0;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-upload-box:hover {
          border-color: #6366f1;
          background: #f5f3ff;
          color: #6366f1;
        }

        .qw-upload-box.active {
          border-color: #6366f1;
          background: #eff6ff;
        }

        .qw-upload-box span {
          font-size: 11px;
          font-weight: 700;
        }

        .qw-upload-tip {
          font-size: 11px;
          margin-top: 10px;
          text-align: center;
        }

        .qw-proof-textarea {
          width: 100%;
          min-height: 120px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          transition: all 0.2s;
        }

        .qw-proof-textarea:focus {
          outline: none;
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .qw-proof-info {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #eff6ff;
          border-radius: 16px;
          color: #1e40af;
          margin-top: 8px;
        }

        .qw-proof-info p {
          margin: 0;
          font-size: 12px;
          line-height: 1.5;
        }

        .qw-proof-footer {
          padding: 24px 32px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }

        .qw-btn-cancel {
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-weight: 600;
          font-size: 14px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .qw-btn-cancel:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .qw-btn-submit {
          padding: 12px 28px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .qw-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .qw-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .qw-spin { animation: qw-spin 1s linear infinite; }
        @keyframes qw-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .animate-proof-in { animation: proofIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes proofIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-pop { animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes pop {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 640px) {
          .qw-proof-modal { border-radius: 0; max-height: 100vh; }
          .qw-proof-header, .qw-proof-body, .qw-proof-footer { padding: 20px; }
          .qw-btn-submit { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

export default SubmitProofModal;
