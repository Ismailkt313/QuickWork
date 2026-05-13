import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import { updateField, setCurrentStep } from "../../../providerOnboarding/store/onboardingSlice";
import { toast } from "react-toastify";
import { cloudinaryService } from "../../../../../services/cloudinaryService";
import { RiUserLine, RiCameraLine, RiArrowLeftLine, RiArrowRightLine, RiPhoneLine } from "react-icons/ri";
import { CustomSelect } from "../../../../../shared/components/ui/CustomSelect";

const IdentityStep: React.FC = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state: RootState) => state.onboarding);
  const [imagePreview, setImagePreview] = useState<string | null>(formData.profileImage || null);
  const [isUploading, setIsUploading] = useState(false);

  const isValidPhone = (p: string) => /^[6-9]\d{9}$/.test(p.trim());

  const isValid =
    formData.profileImage &&
    formData.headline.trim().length > 0 &&
    formData.about.trim().length >= 80 &&
    isValidPhone(formData.phone) &&
    formData.yearsOfExperience >= 0 &&
    !isUploading;

  const strength = (() => {
    let s = 20;
    if (formData.profileImage) s += 20;
    if (formData.headline.trim()) s += 20;
    if (formData.about.trim().length >= 80) s += 20;
    if (formData.phone.trim()) s += 20;
    return s;
  })();

  const set = (field: keyof typeof formData, value: string | number) =>
    dispatch(updateField({ field, value }));

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.warning("Max file size is 2MB"); return; }
    setIsUploading(true);
    try {
      const res = await cloudinaryService.uploadImage(file, "quickwork/profile-images");
      setImagePreview(res.secure_url);
      dispatch(updateField({ field: "profileImage", value: res.secure_url }));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="ob-page">
      <div className="ob-container">
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <div className="ob-step-badge">Step 1 of 4</div>
          <h1 className="ob-page-title">Professional Identity</h1>
          <p className="ob-page-subtitle">Create a trusted profile that showcases your expertise to clients.</p>
        </div>

        {/* Card */}
        <div className="ob-card">
          {/* Progress */}
          <div style={{ padding: "20px 28px", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Profile Strength</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{strength}%</span>
            </div>
            <div className="ob-progress-bar">
              <div className="ob-progress-fill" style={{ width: `${strength}%` }} />
            </div>
          </div>

          <div className="ob-card-body">
            {/* Avatar upload */}
            <div className="ob-avatar-wrap" style={{ marginBottom: 32 }}>
              <div className="ob-avatar">
                <div className="ob-avatar-img">
                  {imagePreview
                    ? <img src={imagePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <RiUserLine size={40} color="#94a3b8" />
                  }
                  {isUploading && (
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)",
                      display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20,
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        border: "2.5px solid #2563eb", borderTopColor: "transparent",
                        animation: "spin 0.7s linear infinite",
                      }} />
                    </div>
                  )}
                </div>
                <label htmlFor="profileImg" className="ob-avatar-btn">
                  <RiCameraLine size={18} />
                  <input id="profileImg" type="file" accept="image/*" className="hidden" onChange={handleImage} style={{ display: "none" }} />
                </label>
              </div>
              <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Upload a professional photo</span>
            </div>

            {/* Headline */}
            <div style={{ marginBottom: 24 }}>
              <label className="ob-label">Professional Headline</label>
              <input
                className="ob-input"
                type="text"
                placeholder="e.g. Master Plumber with 10+ Years Experience"
                value={formData.headline}
                onChange={e => set("headline", e.target.value)}
              />
              <span className="ob-hint">A short summary of what you do best.</span>
            </div>

            {/* About */}
            <div style={{ marginBottom: 24 }}>
              <label className="ob-label">About Your Expertise</label>
              <textarea
                className="ob-textarea"
                rows={5}
                placeholder="Describe your background, skills, and what makes your service stand out..."
                value={formData.about}
                onChange={e => set("about", e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: formData.about.length < 80 ? "#ef4444" : "#059669" }}>
                  {formData.about.length < 80 ? `${80 - formData.about.length} more characters needed` : "Looks good!"}
                </span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{formData.about.length}/500</span>
              </div>
            </div>

            {/* Experience + Phone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 }}>
              <div>
                <label className="ob-label">Experience</label>
                <CustomSelect
                  value={String(formData.yearsOfExperience)}
                  onChange={(v) => set("yearsOfExperience", parseInt(v))}
                  options={[...Array(21)].map((_, i) => ({
                    value: String(i),
                    label: i === 20 ? "20+ Years" : i === 1 ? "1 Year" : `${i} Years`,
                  }))}
                  fullWidth
                  size="lg"
                />
              </div>
              <div>
                <label className="ob-label">Phone Number</label>
                <div className="ob-icon-wrap">
                  <span className="ob-icon"><RiPhoneLine size={18} /></span>
                  <input
                    className="ob-input ob-input-with-icon"
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={e => set("phone", e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
            </div>

            {/* Nav */}
            <div className="ob-nav-row">
              <button className="ob-btn-secondary" onClick={() => dispatch(setCurrentStep(0))}>
                <RiArrowLeftLine size={18} /> Back
              </button>
              <button className="ob-btn-primary" disabled={!isValid} onClick={() => dispatch(setCurrentStep(2))}>
                Continue <RiArrowRightLine size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default IdentityStep;