import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../../../app/store";
import { setCurrentStep, setAgreedToTerms, resetOnboarding } from "../../../providerOnboarding/store/onboardingSlice";
import { submitProviderApplication } from "../../../../provider/services/provider.service";
import { toast } from "react-toastify";
import { RiUserLine, RiPhoneLine, RiMapPinLine, RiArrowLeftLine, RiCheckboxCircleLine, RiEditLine, RiInformationLine } from "react-icons/ri";

const ReviewStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formData } = useSelector((state: RootState) => state.onboarding);
  const [accuracy, setAccuracy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isValid = accuracy && formData.agreedToTerms && formData.skills.length >= 1 && formData.location !== null && formData.portfolio.length >= 1;

  const submit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const payload = {
        headline: formData.headline,
        about: formData.about,
        profileImage: formData.profileImage || "https://placedog.net/500",
        skills: formData.skills.filter(s => !s.id.startsWith("req_")).map(s => s.id),
        yearsOfExperience: formData.yearsOfExperience,
        hourlyRate: formData.hourlyRate,
        location: formData.location!,
        portfolio: formData.portfolio.map(p => ({ title: p.title, description: p.description, images: p.images })),
      };
      const r = await submitProviderApplication(payload);
      if (r.success && r.data?.accessToken) {
        localStorage.setItem("token", r.data.accessToken);
        dispatch(resetOnboarding()); navigate("/provider/success");
      } else {
        dispatch(resetOnboarding()); navigate("/provider/status"); toast.success("Application submitted!");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const sectionStyle = { background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: 20, marginBottom: 16 };
  const sectionHeader = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 } as const;
  const sectionTitle = { fontSize: 13, fontWeight: 700, color: "#334155", textTransform: "uppercase" as const, letterSpacing: "0.06em" };
  const editBtn = { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#2563eb", fontSize: 13, fontWeight: 600, cursor: "pointer" } as const;

  return (
    <div className="ob-page">
      <div className="ob-container">
        <div style={{ textAlign: "center" }}>
          <div className="ob-step-badge">Step 4 of 4</div>
          <h1 className="ob-page-title">Review & Submit</h1>
          <p className="ob-page-subtitle">Review your details carefully before submitting for verification.</p>
        </div>

        <div className="ob-card">
          <div className="ob-card-body">
            {/* Identity */}
            <div style={sectionStyle}>
              <div style={sectionHeader}>
                <span style={sectionTitle}>Identity & Background</span>
                <button style={editBtn} onClick={() => dispatch(setCurrentStep(1))}><RiEditLine size={14} /> Edit</button>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                {formData.profileImage
                  ? <img src={formData.profileImage} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: "cover", border: "1.5px solid #e2e8f0", flexShrink: 0 }} />
                  : <div style={{ width: 72, height: 72, borderRadius: 14, background: "#f1f5f9", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><RiUserLine size={28} color="#94a3b8" /></div>
                }
                <div>
                  <p style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", margin: "0 0 4px" }}>{formData.headline || "No headline set"}</p>
                  <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px" }}>{formData.yearsOfExperience} Years Experience</p>
                  <p style={{ fontSize: 13, color: "#64748b", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    <RiPhoneLine size={14} />{formData.phone.replace(/.(?=.{4})/g, "*") || "N/A"}
                  </p>
                </div>
              </div>
              {formData.about && (
                <p style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0", fontSize: "0.9rem", color: "#64748b", lineHeight: 1.65, margin: "16px 0 0" }}>
                  "{formData.about}"
                </p>
              )}
            </div>

            {/* Skills */}
            <div style={sectionStyle}>
              <div style={sectionHeader}>
                <span style={sectionTitle}>Skills & Service Area</span>
                <button style={editBtn} onClick={() => dispatch(setCurrentStep(2))}><RiEditLine size={14} /> Edit</button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {formData.skills.length
                  ? formData.skills.map(s => (
                      <span key={s.id} className="ob-chip ob-chip-blue" style={{ textTransform: "capitalize" }}>{s.name}</span>
                    ))
                  : <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>Required</span>
                }
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <RiMapPinLine size={16} color="#2563eb" />
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                    {formData.location?.name || <span style={{ color: "#ef4444" }}>Location required</span>}
                  </span>
                </div>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a" }}>
                  &#8377;{formData.hourlyRate}<span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>/hr</span>
                </span>
              </div>
            </div>

            {/* Portfolio */}
            <div style={sectionStyle}>
              <div style={sectionHeader}>
                <span style={sectionTitle}>Portfolio</span>
                <button style={editBtn} onClick={() => dispatch(setCurrentStep(3))}><RiEditLine size={14} /> Edit</button>
              </div>
              {formData.portfolio.length === 0
                ? <p style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>At least 1 project required.</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {formData.portfolio.map((p, i) => (
                      <div key={p.id} style={{ paddingBottom: i < formData.portfolio.length - 1 ? 16 : 0, borderBottom: i < formData.portfolio.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                        <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{p.title}</p>
                        {p.description && <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: 10, lineHeight: 1.6 }}>{p.description}</p>}
                        <div style={{ display: "flex", gap: 10 }}>
                          {p.images.slice(0, 3).map((img, idx) => (
                            <img key={idx} src={img} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", border: "1.5px solid #e2e8f0" }} />
                          ))}
                          {p.images.length > 3 && (
                            <div style={{ width: 64, height: 64, borderRadius: 10, background: "#f1f5f9", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#64748b" }}>
                              +{p.images.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            {/* Agreement */}
            <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: 16, padding: 20, marginBottom: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Agreement & Verification
              </p>
              <label className="ob-checkbox-row" style={{ marginBottom: 14 }}>
                <input type="checkbox" className="ob-checkbox" checked={accuracy} onChange={e => setAccuracy(e.target.checked)} />
                <span style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.6 }}>
                  I confirm the information provided is accurate and truthfully represents my professional background.
                </span>
              </label>
              <label className="ob-checkbox-row">
                <input type="checkbox" className="ob-checkbox" checked={formData.agreedToTerms} onChange={e => dispatch(setAgreedToTerms(e.target.checked))} />
                <span style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.6 }}>
                  I agree to QuickWork's service guidelines and understand my profile is subject to approval.
                </span>
              </label>
            </div>

            {/* Nav */}
            <div className="ob-nav-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <button className="ob-btn-secondary" onClick={() => dispatch(setCurrentStep(3))}>
                  <RiArrowLeftLine size={18} /> Back
                </button>
                <button className="ob-btn-primary" disabled={!isValid || submitting} onClick={submit} style={{ flex: 1, minWidth: 180 }}>
                  {submitting ? "Submitting…" : "Submit for Verification"}
                  {!submitting && <RiCheckboxCircleLine size={18} />}
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#059669", fontSize: 13, fontWeight: 600 }}>
                <RiInformationLine size={14} /> Review typically takes 24–48 hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
