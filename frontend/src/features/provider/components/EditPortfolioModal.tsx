import React, { useState, useRef } from "react";
import {
  RiCloseLine,
  RiSaveLine,
  RiDeleteBin7Line,
  RiImageAddLine,
  RiLoader4Line,
} from "react-icons/ri";
import {
  updateProviderProfile,
  uploadImage,
} from "../services/provider.service";
import { toast } from "react-toastify";
import "./Modals.css";

interface PortfolioItem {
  title: string;
  description: string;
  images: string[];
}

interface EditPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  portfolio: PortfolioItem[];
  itemToEdit: PortfolioItem | null;
}

const EditPortfolioModal: React.FC<EditPortfolioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  portfolio,
  itemToEdit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: itemToEdit?.title || "",
    description: itemToEdit?.description || "",
    images: itemToEdit?.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Project title is required";
    if (formData.images.length === 0)
      newErrors.images = "At least one project image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadImage(file, "portfolio");
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, response.data.imageUrl],
        }));
        toast.success("Image uploaded");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let updatedPortfolio: PortfolioItem[];
      if (itemToEdit) {

        updatedPortfolio = portfolio.map((item) =>
          item.title === itemToEdit.title ? formData : item,
        );
      } else {

        updatedPortfolio = [...portfolio, formData];
      }

      const response = await updateProviderProfile({
        portfolio: updatedPortfolio,
      });
      if (response.success) {
        toast.success(itemToEdit ? "Project updated" : "Project added");
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update portfolio";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    if (!itemToEdit) return;

    setLoading(true);
    try {
      const updatedPortfolio = portfolio.filter(
        (item) => item.title !== itemToEdit.title,
      );
      if (updatedPortfolio.length === 0) {
        toast.error("At least one portfolio item is required");
        setLoading(false);
        return;
      }

      const response = await updateProviderProfile({
        portfolio: updatedPortfolio,
      });
      if (response.success) {
        toast.success("Project deleted");
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete project";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="qw-modal-backdrop animate__animated animate__fadeIn">
      <div className="qw-modal-content edit-portfolio p-4 animate__animated animate__zoomIn">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="qw-h2 m-0 text-primary">
            {itemToEdit ? "Edit Project" : "Add New Project"}
          </h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label font-md fw-600">Project Title</label>
              <input
                type="text"
                className={`form-control qw-input ${errors.title ? "is-invalid" : ""}`}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Modern Bathroom Renovation"
              />
              {errors.title && (
                <div className="invalid-feedback">{errors.title}</div>
              )}
            </div>

            <div className="col-12">
              <label className="form-label font-md fw-600">
                Project Description
              </label>
              <textarea
                className="form-control qw-input"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Briefly describe the project and what you achieved..."
              />
            </div>

            <div className="col-12">
              <label className="form-label font-md fw-600">
                Project Images
              </label>
              <label
                className="qw-upload-zone mb-3 d-block position-relative"
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    zIndex: 2
                  }}
                />
                <div className="d-flex flex-column align-items-center gap-2">
                  {uploading ? (
                    <RiLoader4Line
                      className="animate-spin text-primary"
                      size={32}
                    />
                  ) : (
                    <RiImageAddLine size={32} className="text-primary" />
                  )}
                  <p className="small fw-600 mb-0">
                    Click to upload project photo
                  </p>
                  <p className="text-muted smaller mb-0">JPEG, PNG up to 2MB</p>
                </div>
              </label>

              {errors.images && (
                <div className="text-danger small mb-3">{errors.images}</div>
              )}

              <div className="qw-image-preview-grid">
                {formData.images.map((url: string, index: number) => (
                  <div key={index} className="qw-image-preview">
                    <img src={url} alt={`Preview ${index}`} />
                    <button
                      type="button"
                      className="qw-remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      <RiCloseLine />
                    </button>
                  </div>
                ))}
                {formData.images.length === 0 && (
                  <div className="qw-image-placeholder">
                    <RiImageAddLine
                      size={40}
                      className="text-muted opacity-25"
                    />
                    <p className="small text-muted m-0">No images added</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mt-5 pt-3 border-top">
            {itemToEdit && (
              <button
                type="button"
                className="btn btn-outline-danger px-4 rounded-pill d-flex align-items-center gap-2"
                onClick={handleDelete}
                disabled={loading}
              >
                <RiDeleteBin7Line /> Delete
              </button>
            )}
            <div className="ms-auto d-flex gap-3">
              <button
                type="button"
                className="btn btn-light rounded-pill px-4"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-5 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <RiSaveLine />
                )}
                {itemToEdit ? "Save Changes" : "Add Project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPortfolioModal;
