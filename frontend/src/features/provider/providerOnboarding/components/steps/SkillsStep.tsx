import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import { addSkill, removeSkill, setHourlyRate, setLocation, setCurrentStep } from "../../../providerOnboarding/store/onboardingSlice";
import { searchSkills, requestSkill } from "../../../../user/serviceProviders/services/skills.service";
import { getLocations, type Location } from "../../../../location/services/location.service";
import { debounce } from "../../../../../utils/debounce";
import { RiSearchLine, RiCloseLine, RiAddLine, RiTimeLine, RiArrowLeftLine, RiArrowRightLine, RiHammerFill } from "react-icons/ri";
import { CustomSelect } from "../../../../../shared/components/ui/CustomSelect";

const SkillsStep: React.FC = () => {
  const dispatch = useDispatch();
  const { formData } = useSelector((state: RootState) => state.onboarding);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locId, setLocId] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  const isValid = (formData.skills?.length || 0) >= 1 && (formData.hourlyRate || 0) > 0 && formData.location !== null;
  const reachedLimit = (formData.skills?.length || 0) >= 10;

  const fetchSkills = useMemo(() => debounce(async (q: string) => {
    if (!q.trim()) { setResults([]); setSearching(false); return; }
    setSearching(true);
    setResults(await searchSkills(q));
    setSearching(false);
  }, 280), []);

  useEffect(() => {
    getLocations().then(r => {
      if (r.success) {
        setLocations(r.data);
        if (formData.location?.id) setLocId(formData.location.id);
      }
    });
  }, [formData.location]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDrop(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const addSkillFn = (s: { id: string; name: string }) => {
    dispatch(addSkill(s)); setQuery(""); setResults([]); setShowDrop(false);
  };

  const requestSkillFn = async () => {
    if (!query.trim()) return;
    const r = await requestSkill(query);
    if (r.success) { dispatch(addSkill({ id: `req_${Date.now()}`, name: query, isRequested: true })); setQuery(""); setResults([]); setShowDrop(false); }
  };

  return (
    <div className="ob-page">
      <div className="ob-container">
        <div style={{ textAlign: "center" }}>
          <div className="ob-step-badge">Step 2 of 4</div>
          <h1 className="ob-page-title">Define Your Expertise</h1>
          <p className="ob-page-subtitle">Help clients understand your skills and where you work.</p>
        </div>

        <div className="ob-card">
          <div className="ob-card-body">
            {/* Skills Search */}
            <div style={{ marginBottom: 28 }}>
              <label className="ob-label">Skills & Expertise</label>
              <div ref={dropRef} style={{ position: "relative" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  border: `1.5px solid ${showDrop ? "#3b82f6" : "#e2e8f0"}`,
                  borderRadius: 12, padding: "0 16px", height: 52,
                  background: "white",
                  boxShadow: showDrop ? "0 0 0 3px rgba(59,130,246,0.12)" : "none",
                  opacity: reachedLimit ? 0.6 : 1,
                }}>
                  <RiSearchLine size={18} color="#94a3b8" />
                  <input
                    type="text"
                    style={{
                      flex: 1, border: "none", outline: "none", background: "transparent",
                      fontSize: "0.9375rem", fontWeight: 500, color: "#1e293b", fontFamily: "Inter, sans-serif",
                    }}
                    placeholder={reachedLimit ? "Maximum 10 skills reached" : "Search skills (e.g. Plumbing, Cleaning…)"}
                    value={query}
                    disabled={reachedLimit}
                    onChange={e => { setQuery(e.target.value); if (e.target.value.trim()) { setSearching(true); fetchSkills(e.target.value); } else { setResults([]); setSearching(false); } setShowDrop(true); }}
                    onFocus={() => setShowDrop(true)}
                  />
                  {searching && <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #2563eb", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />}
                  {query && !searching && (
                    <button onClick={() => { setQuery(""); setResults([]); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                      <RiCloseLine size={20} />
                    </button>
                  )}
                </div>

                {showDrop && query.trim() && (
                  <div className="ob-dropdown">
                    {searching ? (
                      <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Searching…</div>
                    ) : results.length > 0 ? (
                      <div style={{ padding: 8 }}>
                        {results.filter(s => !formData.skills?.some(fs => fs.id === s.id)).map(skill => (
                          <button key={skill.id} onClick={() => addSkillFn(skill)} style={{
                            display: "flex", alignItems: "center", gap: 12, width: "100%",
                            padding: "10px 12px", border: "none", background: "none", cursor: "pointer",
                            borderRadius: 10, textAlign: "left",
                          }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#eff6ff")}
                            onMouseLeave={e => (e.currentTarget.style.background = "none")}
                          >
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}>
                              <RiHammerFill size={16} />
                            </div>
                            <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#1e293b", textTransform: "capitalize" }}>{skill.name}</span>
                            <RiAddLine size={16} color="#2563eb" style={{ marginLeft: "auto" }} />
                          </button>
                        ))}
                        <div style={{ borderTop: "1px solid #f1f5f9", margin: "4px 0", padding: "4px 0" }}>
                          <button onClick={requestSkillFn} style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "10px 12px", border: "none", background: "none", cursor: "pointer",
                            borderRadius: 10, color: "#2563eb", fontSize: "0.875rem", fontWeight: 600,
                          }}>
                            <RiAddLine size={18} /> Request "{query}"
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: 24, textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>No matches for "{query}"</p>
                        <button onClick={requestSkillFn} className="ob-btn-primary" style={{ height: 40, padding: "0 20px", fontSize: "0.875rem" }}>
                          Propose as new skill
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected chips */}
              {(formData.skills?.length || 0) > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  {formData.skills?.map(s => (
                    <span key={s.name} className={`ob-chip ${s.isRequested ? "ob-chip-amber" : "ob-chip-blue"}`}>
                      {s.name}
                      {s.isRequested && <RiTimeLine size={13} title="Pending" />}
                      <button onClick={() => dispatch(removeSkill(s.name))} style={{ background: "none", border: "none", cursor: "pointer", color: "currentColor", display: "flex", padding: 0, opacity: 0.6 }}>
                        <RiCloseLine size={15} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{formData.skills?.length || 0}/10 added</span>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Min. 1 required</span>
              </div>
            </div>

            {/* Hourly Rate */}
            <div style={{ marginBottom: 28 }}>
              <label className="ob-label">Hourly Rate</label>
              <div className="ob-icon-wrap" style={{ maxWidth: 220 }}>
                <span className="ob-icon" style={{ fontWeight: 600, fontSize: 16 }}>&#8377;</span>
                <input
                  className="ob-input ob-input-with-icon"
                  type="number"
                  placeholder="e.g. 500"
                  value={formData.hourlyRate || ""}
                  onChange={e => dispatch(setHourlyRate(Number(e.target.value)))}
                  min="1"
                />
              </div>
              <span className="ob-hint">Set a competitive rate based on your market.</span>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 8 }}>
              <label className="ob-label">Service Location</label>
              <CustomSelect
                value={locId}
                onChange={(v) => {
                  const loc = locations.find(l => String(l.id) === v);
                  setLocId(v);
                  dispatch(setLocation(loc ? { name: loc.name, id: loc.id } : null));
                }}
                options={[
                  { value: "", label: "Select your district" },
                  ...locations.map(l => ({ value: String(l.id), label: l.name }))
                ]}
                fullWidth
                size="lg"
              />
            </div>

            {/* Nav */}
            <div className="ob-nav-row">
              <button className="ob-btn-secondary" onClick={() => dispatch(setCurrentStep(1))}>
                <RiArrowLeftLine size={18} /> Back
              </button>
              <button className="ob-btn-primary" disabled={!isValid} onClick={() => dispatch(setCurrentStep(3))}>
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

export default SkillsStep;
