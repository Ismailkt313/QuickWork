import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import { setCurrentStep, addPortfolioProject, removePortfolioProject, updatePortfolioProject, addPortfolioImage, removePortfolioImage } from "../../../providerOnboarding/store/onboardingSlice";
import { toast } from "react-toastify";
import { cloudinaryService } from "../../../../../services/cloudinaryService";
import { RiImageAddLine, RiDeleteBinLine, RiArrowLeftLine, RiArrowRightLine, RiCloseLine, RiAddLine, RiLoader4Line } from "react-icons/ri";

const PortfolioStep: React.FC = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state: RootState) => state.onboarding);
  const fileInputRefs = useRef<{ [k: string]: HTMLInputElement | null }>({});
  const [uploading, setUploading] = useState<{ [k: string]: boolean }>({});

  const isValid =
    formData.portfolio.length >= 1 &&
    formData.portfolio.every(p => p.title.trim() !== "" && p.images.length >= 1) &&
    !Object.values(uploading).some(v => v);

  const addProject = () => dispatch(addPortfolioProject({ id: `proj_${Date.now()}`, title: "", description: "", images: [] }));

  const upload = async (e: React.ChangeEvent<HTMLInputElement>, pid: string) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(p => ({ ...p, [pid]: true }));
    try {
      for (const file of Array.from(files)) {
        if (file.size > 2 * 1024 * 1024) { toast.warning(`"${file.name}" exceeds 2MB`); continue; }
        const r = await cloudinaryService.uploadImage(file, "quickwork/portfolio-images");
        dispatch(addPortfolioImage({ projectId: pid, image: r.secure_url }));
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(p => ({ ...p, [pid]: false }));
      if (fileInputRefs.current[pid]) fileInputRefs.current[pid]!.value = "";
    }
  };

  return (
    <div className="ob-page">
      <div className="ob-container">
        <div style={{ textAlign: "center" }}>
          <div className="ob-step-badge">Step 3 of 4</div>
          <h1 className="ob-page-title">Showcase Your Work</h1>
          <p className="ob-page-subtitle">Clients hire providers with real project examples. Add at least one.</p>
        </div>

        <div className="ob-card">
          <div className="ob-card-body">
            {/* Projects */}
            {formData.portfolio.map((p, i) => (
              <div key={p.id} className="ob-project-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Project {i + 1}
                  </span>
                  <button onClick={() => dispatch(removePortfolioProject(p.id))} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                    background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
                    borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}>
                    <RiDeleteBinLine size={14} /> Remove
                  </button>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="ob-label">Project Title <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    className="ob-input"
                    type="text"
                    placeholder="e.g. Modern Kitchen Plumbing Refit"
                    value={p.title}
                    onChange={e => dispatch(updatePortfolioProject({ ...p, title: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="ob-label">Description <span style={{ fontSize: 12, color: "#94a3b8" }}>(Optional)</span></label>
                  <textarea
                    className="ob-textarea"
                    rows={3}
                    placeholder="Briefly describe what you did…"
                    value={p.description}
                    onChange={e => dispatch(updatePortfolioProject({ ...p, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="ob-label">Images <span style={{ color: "#ef4444" }}>*</span></label>
                  {p.images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                      {p.images.map((img, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <img src={img} alt="Preview" style={{ width: 76, height: 76, borderRadius: 10, objectFit: "cover", border: "1.5px solid #e2e8f0" }} />
                          <button onClick={() => dispatch(removePortfolioImage({ projectId: p.id, imageIndex: idx }))} style={{
                            position: "absolute", top: -8, right: -8, width: 24, height: 24,
                            background: "#0f172a", color: "white", border: "2px solid white",
                            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                          }}>
                            <RiCloseLine size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple style={{ display: "none" }}
                    ref={el => { fileInputRefs.current[p.id] = el; }}
                    onChange={e => upload(e, p.id)}
                  />
                  <button onClick={() => fileInputRefs.current[p.id]?.click()} disabled={uploading[p.id]} style={{
                    display: "inline-flex", alignItems: "center", gap: 8, height: 44,
                    padding: "0 20px", background: "white", border: "1.5px solid #e2e8f0",
                    borderRadius: 10, cursor: uploading[p.id] ? "not-allowed" : "pointer",
                    fontSize: 13, fontWeight: 600, color: "#334155", opacity: uploading[p.id] ? 0.6 : 1,
                  }}>
                    {uploading[p.id]
                      ? <><RiLoader4Line size={16} style={{ animation: "spin 0.7s linear infinite", color: "#2563eb" }} /> Uploading…</>
                      : <><RiImageAddLine size={16} color="#2563eb" /> Upload Images</>
                    }
                  </button>
                  {p.images.length === 0 && <p style={{ marginTop: 8, fontSize: 12, color: "#ef4444", fontWeight: 500 }}>At least 1 image required.</p>}
                </div>
              </div>
            ))}

            {/* Add Project */}
            <button onClick={addProject} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", height: 52, borderRadius: 12,
              border: "1.5px dashed #cbd5e1", background: "#f8fafc",
              color: "#64748b", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#64748b"; }}
            >
              <RiAddLine size={18} /> Add Project
            </button>

            {/* Nav */}
            <div className="ob-nav-row">
              <button className="ob-btn-secondary" onClick={() => dispatch(setCurrentStep(2))}>
                <RiArrowLeftLine size={18} /> Back
              </button>
              <button className="ob-btn-primary" disabled={!isValid} onClick={() => dispatch(setCurrentStep(4))}>
                Review Details <RiArrowRightLine size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default PortfolioStep;
