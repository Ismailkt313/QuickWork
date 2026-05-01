import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  RiCloseLine,
  RiSaveLine,
  RiCameraLine,
  RiLoader4Line,
  RiEditLine,
} from "react-icons/ri";
import {
  updateProviderProfile,
  uploadImage,
} from "../services/provider.service";
import { toast } from "react-toastify";
import "./Modals.css";

interface Location {
  id: string;
  name: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  provider: {
    name: string;
    headline?: string;
    about?: string;
    hourlyRate?: number;
    yearsOfExperience?: number;
    isActive?: boolean;
    location?: Location;
    profileImage?: string;
  };
  locations: Location[];
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  provider,
  locations,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    headline: provider.headline || "",
    about: provider.about || "",
    hourlyRate: provider.hourlyRate || 0,
    yearsOfExperience: provider.yearsOfExperience || 0,
    isActive: provider.isActive,
    location: provider.location || { id: "", name: "" },
    profileImage: provider.profileImage || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadImage(file, "profile");
      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          profileImage: response.data.imageUrl,
        }));
        toast.success("Profile image uploaded");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.headline.trim()) newErrors.headline = "Headline is required";
    if (formData.about.trim().length < 80)
      newErrors.about = "About must be at least 80 characters long";
    if (formData.hourlyRate <= 0)
      newErrors.hourlyRate = "Hourly rate must be greater than 0";
    if (formData.yearsOfExperience < 0)
      newErrors.yearsOfExperience = "Years of experience cannot be negative";
    if (!formData.location.id) newErrors.location = "Please select a location";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await updateProviderProfile(formData);
      if (response.success) {
        toast.success("Profile updated successfully");
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="qw-modal-overlay">
      <div className="qw-modal-container" style={{ maxWidth: '600px' }}>
        <div className="qw-modal-header">
          <div className="qw-modal-header-icon-box blue">
            <RiEditLine size={24} />
          </div>
          <div className="qw-modal-header-text">
            <h2 className="qw-modal-title">Edit Professional Profile</h2>
            <p className="qw-modal-subtitle">Update your public identity and service details</p>
          </div>
          <button className="qw-modal-close" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="qw-modal-body p-4">
          <form id="editProfileForm" onSubmit={handleSubmit}>
            <div className="row g-4">
              {}
              <div className="col-12">
                <div className="qw-image-upload-area p-3 border rounded-3 d-flex align-items-center gap-4">
                   <div 
                    className="qw-avatar-upload-preview" 
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '24px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      border: '4px solid #f1f5f9'
                    }}
                  >
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 bg-light text-primary fw-bold">
                        {provider.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="qw-avatar-upload-overlay" style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      opacity: uploading ? 1 : 0,
                      transition: 'opacity 0.2s'
                    }}>
                      {uploading ? <RiLoader4Line className="animate-spin" /> : <RiCameraLine size={24} />}
                    </div>
                  </div>
                  <div>
                    <h5 className="mb-1">Profile Photo</h5>
                    <p className="text-muted small mb-2">JPG, PNG or GIF. Max size of 2MB.</p>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary btn-sm rounded-pill"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose New Photo
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden />
                  </div>
                </div>
              </div>

              {}
              <div className="col-12">
                <label className="qw-field-label">Professional Headline</label>
                <input
                  type="text"
                  className={`form-control qw-modal-input ${errors.headline ? 'is-invalid' : ''}`}
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Expert Home Maintenance Specialist"
                />
                {errors.headline && <div className="invalid-feedback">{errors.headline}</div>}
              </div>

              {}
              <div className="col-12">
                <label className="qw-field-label">About Me (Bio)</label>
                <textarea
                  className={`form-control qw-modal-input ${errors.about ? 'is-invalid' : ''}`}
                  rows={4}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Tell clients about your expertise and why they should hire you..."
                />
                <div className="d-flex justify-content-between mt-1">
                  <span className="small text-muted">{formData.about.length} characters</span>
                  {errors.about && <span className="text-danger small">{errors.about}</span>}
                </div>
              </div>

              {}
              <div className="col-md-6">
                <label className="qw-field-label">Hourly Rate (₹)</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">₹</span>
                  <input
                    type="number"
                    className={`form-control qw-modal-input border-start-0 ${errors.hourlyRate ? 'is-invalid' : ''}`}
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="qw-field-label">Years of Experience</label>
                <input
                  type="number"
                  className={`form-control qw-modal-input ${errors.yearsOfExperience ? 'is-invalid' : ''}`}
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                />
              </div>

              {}
              <div className="col-12">
                <label className="qw-field-label">Primary Service Location</label>
                <select
                  className={`form-select qw-modal-input ${errors.location ? 'is-invalid' : ''}`}
                  value={formData.location.id}
                  onChange={(e) => {
                    const selected = locations.find(l => l.id === e.target.value);
                    if (selected) setFormData({ ...formData, location: { id: selected.id, name: selected.name } });
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>

              {}
              <div className="col-12">
                <div className="qw-status-toggle-card p-3 rounded-4 bg-light d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="mb-1">Availability Status</h6>
                    <p className="small text-muted mb-0">Switch off when you're not accepting new jobs</p>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '45px', height: '24px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="qw-modal-footer">
          <button className="qw-modal-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            type="submit" 
            form="editProfileForm" 
            className="qw-modal-submit-btn" 
            disabled={loading || uploading}
          >
            {loading ? <RiLoader4Line className="animate-spin" size={20} /> : <RiSaveLine size={20} />}
            <span>{loading ? "Saving Changes..." : "Save Profile"}</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .qw-avatar-upload-preview:hover .qw-avatar-upload-overlay {
          opacity: 1 !important;
        }
        .animate-spin {
          animation: qw-spin 1s linear infinite;
        }
        @keyframes qw-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default EditProfileModal;
