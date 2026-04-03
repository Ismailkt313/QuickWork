import React, { useState, useRef } from 'react';
import { RiCloseLine, RiSaveLine, RiCameraLine, RiLoader4Line } from 'react-icons/ri';
import { updateProviderProfile, uploadImage } from '../services/provider.service';
import { toast } from 'react-toastify';
import './Modals.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  provider: any;
  locations: any[];
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  provider, 
  locations 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    headline: provider.headline || '',
    about: provider.about || '',
    hourlyRate: provider.hourlyRate || 0,
    yearsOfExperience: provider.yearsOfExperience || 0,
    isActive: provider.isActive,
    location: provider.location || { id: '', name: '' },
    profileImage: provider.profileImage || ''
  });

  const [errors, setErrors] = useState<any>({});
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
      const response = await uploadImage(file, 'profile');
      if (response.success) {
        setFormData(prev => ({ ...prev, profileImage: response.data.imageUrl }));
        toast.success("Profile image uploaded");
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.headline.trim()) newErrors.headline = "Headline is required";
    if (formData.about.trim().length < 80) newErrors.about = "About must be at least 80 characters long";
    if (formData.hourlyRate <= 0) newErrors.hourlyRate = "Hourly rate must be greater than 0";
    if (formData.yearsOfExperience < 0) newErrors.yearsOfExperience = "Years of experience cannot be negative";
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
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="qw-modal-backdrop animate__animated animate__fadeIn">
      <div className="qw-modal-content edit-profile p-4 animate__animated animate__zoomIn">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="qw-h2 m-0 text-primary">Edit Basic Profile</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Avatar Upload */}
            <div className="col-12 mb-3">
              <div className="d-flex align-items-center gap-4">
                <div className="qw-edit-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="qw-edit-avatar" />
                  ) : (
                    <div className="qw-edit-avatar initials">
                      {provider.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                  <div className="qw-edit-avatar-overlay">
                    {uploading ? <RiLoader4Line className="animate-spin" /> : <RiCameraLine size={24} />}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    hidden 
                  />
                </div>
                <div>
                  <h4 className="qw-h4 mb-1">Profile Photo</h4>
                  <p className="text-muted small mb-0">Recommended: Square image, max 2MB</p>
                  <button 
                    type="button" 
                    className="btn btn-link btn-sm p-0 text-primary fw-600 mt-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="col-12">
              <label className="form-label font-md fw-600">Headline</label>
              <input 
                type="text" 
                className={`form-control qw-input ${errors.headline ? 'is-invalid' : ''}`}
                value={formData.headline}
                onChange={(e) => setFormData({...formData, headline: e.target.value})}
                placeholder="e.g. Professional Plumber & Senior Technician"
              />
              {errors.headline && <div className="invalid-feedback">{errors.headline}</div>}
            </div>

            {/* About */}
            <div className="col-12">
              <label className="form-label font-md fw-600">About (Min 80 chars)</label>
              <textarea 
                className={`form-control qw-input ${errors.about ? 'is-invalid' : ''}`}
                rows={4}
                value={formData.about}
                onChange={(e) => setFormData({...formData, about: e.target.value})}
                placeholder="Describe your services, approach and expertise..."
              />
              <div className="d-flex justify-content-between mt-1">
                {errors.about && <div className="text-danger small">{errors.about}</div>}
                <div className={`ms-auto small ${formData.about.length < 80 ? 'text-muted' : 'text-success'}`}>
                  {formData.about.length} characters
                </div>
              </div>
            </div>

            {/* Rate & Experience */}
            <div className="col-md-6">
              <label className="form-label font-md fw-600">Hourly Rate ($)</label>
              <input 
                type="number" 
                className={`form-control qw-input ${errors.hourlyRate ? 'is-invalid' : ''}`}
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})}
              />
              {errors.hourlyRate && <div className="invalid-feedback">{errors.hourlyRate}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label font-md fw-600">Years of Experience</label>
              <input 
                type="number" 
                className={`form-control qw-input ${errors.yearsOfExperience ? 'is-invalid' : ''}`}
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({...formData, yearsOfExperience: Number(e.target.value)})}
              />
              {errors.yearsOfExperience && <div className="invalid-feedback">{errors.yearsOfExperience}</div>}
            </div>

            {/* Location */}
            <div className="col-12">
              <label className="form-label font-md fw-600">Primary Location</label>
              <select 
                className={`form-select qw-input ${errors.location ? 'is-invalid' : ''}`}
                value={formData.location.id}
                onChange={(e) => {
                  const selected = locations.find(l => l.id === e.target.value);
                  if (selected) setFormData({...formData, location: { id: selected.id, name: selected.name }});
                }}
              >
                <option value="">Select a location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              {errors.location && <div className="invalid-feedback">{errors.location}</div>}
            </div>

            {/* Status */}
            <div className="col-12">
              <div className="form-check form-switch p-3 bg-light rounded border">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label className="form-check-label fw-600 ms-2" htmlFor="isActiveToggle">
                  Show my profile as Active
                </label>
                <p className="small text-muted mb-0 ms-2 mt-1">If inactive, clients cannot find you in search results.</p>
              </div>
            </div>
          </div>

          <div className="d-flex gap-3 mt-5">
            <button type="button" className="btn btn-light rounded-pill flex-grow-1" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <RiSaveLine />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
