import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import {
    addSkill,
    removeSkill,
    setHourlyRate,
    setLocation,
    setCurrentStep
} from "../../store/onboardingSlice";
import { searchSkills, requestSkill } from "../../../../services/skill.service";
import { searchLocation, selectLocation } from "../../../../services/location.service";
import { debounce } from "../../../../utils/debounce";

const SkillsStep: React.FC = () => {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.onboarding);

    const [skillQuery, setSkillQuery] = useState("");
    const [skillResults, setSkillResults] = useState<{ id: string; name: string }[]>([]);
    const [isSearchingSkills, setIsSearchingSkills] = useState(false);
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);
    const skillInputRef = useRef<HTMLDivElement>(null);

    const [locationQuery, setLocationQuery] = useState(formData.location?.name || "");
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    const isValid =
        (formData.skills?.length || 0) >= 1 &&
        (formData.hourlyRate || 0) > 0 &&
        formData.location !== null;

    const fetchSkills = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setSkillResults([]);
                setIsSearchingSkills(false);
                return;
            }
            setIsSearchingSkills(true);
            const results = await searchSkills(query);
            setSkillResults(results);
            setIsSearchingSkills(false);
        }, 280),
        []
    );

    useEffect(() => {
        if (skillQuery.trim()) {
            setIsSearchingSkills(true);
            fetchSkills(skillQuery);
        } else {
            setSkillResults([]);
            setIsSearchingSkills(false);
        }
    }, [skillQuery, fetchSkills]);

    const handleAddSkill = (skill: { id: string; name: string }) => {
        dispatch(addSkill(skill));
        setSkillQuery("");
        setSkillResults([]);
        setShowSkillDropdown(false);
    };

    const handleRequestSkill = async () => {
        if (!skillQuery.trim()) return;
        const result = await requestSkill(skillQuery);
        if (result.success) {
            dispatch(addSkill({ id: `req_${Date.now()}`, name: skillQuery, isRequested: true }));
            setSkillQuery("");
            setSkillResults([]);
            setShowSkillDropdown(false);
        }
    };

    const fetchLocations = useCallback(
        debounce(async (query: string) => {
            if (query.length < 3) { setLocationResults([]); return; }
            setIsSearchingLocation(true);
            const results = await searchLocation(query);
            setLocationResults(results);
            setIsSearchingLocation(false);
            setShowLocationDropdown(true);
        }, 500),
        []
    );

    useEffect(() => {
        if (locationQuery !== formData.location?.name) {
            fetchLocations(locationQuery);
        }
    }, [locationQuery, fetchLocations, formData.location]);

    const handleSelectLocation = async (loc: any) => {
        setLocationQuery(loc.name);
        setShowLocationDropdown(false);
        setIsSearchingLocation(true);
        try {
            const { id } = await selectLocation({ name: loc.name, lat: loc.lat, lon: loc.lon });
            dispatch(setLocation({ ...loc, id }));
        } catch (error: any) {
            setLocationQuery("");
            dispatch(setLocation(null));
        } finally {
            setIsSearchingLocation(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (skillInputRef.current && !skillInputRef.current.contains(e.target as Node)) {
                setShowSkillDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const reachedLimit = (formData.skills?.length || 0) >= 10;

    return (
        <div className="container py-3 py-md-5" style={{ maxWidth: "680px" }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold">Define Your Expertise & Service Area</h4>
                    <p className="text-secondary small">Help clients understand what you offer and where you work.</p>
                </div>

                <div className="row g-4">
                    {/* ── Skills Input ── */}
                    <div className="col-12">
                        <label className="form-label fw-bold small">Skills & Expertise</label>

                        {/* Autocomplete container */}
                        <div ref={skillInputRef} className="position-relative">
                            {/* Input row */}
                            <div
                                className="d-flex align-items-center gap-2 px-3 rounded-3"
                                style={{
                                    border: showSkillDropdown ? "2px solid #3b82f6" : "2px solid #e2e8f0",
                                    background: reachedLimit ? "#f8fafc" : "#fff",
                                    transition: "border-color 0.15s",
                                    minHeight: 44,
                                }}
                            >
                                <i className="bi bi-search text-muted" style={{ fontSize: 14 }} />
                                <input
                                    type="text"
                                    style={{
                                        flex: 1, border: "none", outline: "none", fontSize: 14,
                                        background: "transparent", padding: "8px 0",
                                    }}
                                    placeholder={reachedLimit ? "Maximum 10 skills reached" : "Search skills (e.g. Plumbing, Cleaning…)"}
                                    value={skillQuery}
                                    disabled={reachedLimit}
                                    onChange={e => {
                                        setSkillQuery(e.target.value);
                                        if (!showSkillDropdown) setShowSkillDropdown(true);
                                    }}
                                    onFocus={() => setShowSkillDropdown(true)}
                                />
                                {/* Spinner while fetching */}
                                {isSearchingSkills && (
                                    <div className="spinner-border spinner-border-sm text-primary" role="status" />
                                )}
                                {/* Clear button */}
                                {skillQuery && !isSearchingSkills && (
                                    <button
                                        type="button"
                                        onClick={() => { setSkillQuery(""); setSkillResults([]); }}
                                        style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 0 }}
                                    >✕</button>
                                )}
                            </div>

                            {/* Dropdown */}
                            {showSkillDropdown && skillQuery.trim() && (
                                <div
                                    className="position-absolute w-100 bg-white rounded-3 border shadow"
                                    style={{ top: "calc(100% + 4px)", zIndex: 50, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}
                                >
                                    {isSearchingSkills ? (
                                        <div className="p-3 text-center text-muted small">
                                            <div className="spinner-border spinner-border-sm me-2" role="status" />
                                            Searching skills…
                                        </div>
                                    ) : skillResults.length > 0 ? (
                                        <>
                                            {skillResults
                                                .filter(s => !formData.skills?.some(fs => fs.id === s.id))
                                                .map(skill => (
                                                    <button
                                                        key={skill.id}
                                                        type="button"
                                                        onMouseDown={e => { e.preventDefault(); handleAddSkill(skill); }}
                                                        className="d-flex align-items-center gap-2 w-100 text-start border-0 bg-transparent px-3 py-2"
                                                        style={{ fontSize: 14, transition: "background 0.1s" }}
                                                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f0f9ff"; }}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                                    >
                                                        <span style={{
                                                            width: 28, height: 28, borderRadius: 6, background: "#eff6ff",
                                                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0,
                                                        }}>🛠️</span>
                                                        <span style={{ fontWeight: 500, color: "#1e293b", textTransform: "capitalize" }}>{skill.name}</span>
                                                        <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>+ Add</span>
                                                    </button>
                                                ))
                                            }
                                            {/* Request skill option always shown at bottom */}
                                            <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 12px" }}>
                                                <button
                                                    type="button"
                                                    onMouseDown={e => { e.preventDefault(); handleRequestSkill(); }}
                                                    className="d-flex align-items-center gap-2 w-100 text-start border-0 bg-transparent rounded-2 px-2 py-1"
                                                    style={{ fontSize: 13, color: "#3b82f6" }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#eff6ff"; }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                                >
                                                    <i className="bi bi-plus-circle" />
                                                    Request <strong style={{ margin: "0 4px" }}>"{skillQuery}"</strong> as a new skill
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-3 text-center">
                                            <p className="text-muted small mb-2">No skills found matching <strong>"{skillQuery}"</strong></p>
                                            <button
                                                type="button"
                                                onMouseDown={e => { e.preventDefault(); handleRequestSkill(); }}
                                                className="btn btn-sm btn-primary rounded-pill px-3"
                                            >
                                                <i className="bi bi-plus me-1" />
                                                Request this skill
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected skill badges */}
                        {(formData.skills?.length || 0) > 0 && (
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {formData.skills?.map(skill => (
                                    <span
                                        key={skill.name}
                                        className={`badge rounded-pill d-flex align-items-center gap-2 py-2 px-3 border ${skill.isRequested
                                                ? "bg-light text-primary border-primary border-opacity-25"
                                                : "bg-primary bg-opacity-10 text-primary border-transparent"
                                            }`}
                                    >
                                        {skill.name}
                                        {skill.isRequested && <i className="bi bi-clock small" title="Pending Approval" />}
                                        <i
                                            className="bi bi-x-circle-fill"
                                            style={{ cursor: "pointer", opacity: 0.6 }}
                                            onClick={() => dispatch(removeSkill(skill.name))}
                                        />
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="form-text text-muted small mt-2">
                            {(formData.skills?.length || 0)}/10 skills selected • Minimum 1 required
                        </div>
                    </div>

                    {/* ── Hourly Rate ── */}
                    <div className="col-12">
                        <label className="form-label fw-bold small">Hourly Rate</label>
                        <div className="row align-items-center">
                            <div className="col-sm-6">
                                <div className="input-group bg-light rounded-2 overflow-hidden">
                                    <span className="input-group-text border-0 bg-transparent ps-3 fw-bold">₹</span>
                                    <input
                                        type="number"
                                        className="form-control border-0 bg-transparent ps-0"
                                        placeholder="e.g. 500"
                                        value={formData.hourlyRate || ""}
                                        onChange={(e) => dispatch(setHourlyRate(Number(e.target.value)))}
                                        min="1"
                                    />
                                </div>
                                <div className="form-text text-muted small mt-1">Set a competitive rate based on your experience.</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Location ── */}
                    <div className="col-12">
                        <label className="form-label fw-bold small">Primary Service Area</label>
                        <div className="position-relative">
                            <div className="input-group bg-light rounded-2 overflow-hidden shadow-sm">
                                <span className="input-group-text border-0 bg-transparent ps-3">
                                    <i className="bi bi-geo-alt text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent ps-0"
                                    placeholder="City or locality you work in"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                                    onFocus={() => locationResults.length > 0 && setShowLocationDropdown(true)}
                                />
                                {isSearchingLocation && (
                                    <span className="input-group-text border-0 bg-transparent">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                                    </span>
                                )}
                            </div>

                            {showLocationDropdown && locationResults.length > 0 && (
                                <div className="list-group position-absolute w-100 z-3 shadow rounded-3 overflow-hidden border mt-1">
                                    {locationResults.map((loc, idx) => (
                                        <button
                                            key={idx}
                                            className="list-group-item list-group-item-action border-0 py-3 small text-start"
                                            onMouseDown={(e) => { e.preventDefault(); handleSelectLocation(loc); }}
                                        >
                                            <i className="bi bi-geo-alt me-2 text-muted" />
                                            {loc.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                    <button
                        onClick={() => dispatch(setCurrentStep(1))}
                        className="btn btn-link text-secondary text-decoration-none fw-bold"
                    >
                        <i className="bi bi-arrow-left me-2" />
                        Back
                    </button>
                    <button
                        disabled={!isValid}
                        onClick={() => dispatch(setCurrentStep(3))}
                        className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow"
                    >
                        Review & Next
                        <i className="bi bi-arrow-right ms-2" />
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
            `}} />
        </div>
    );
};

export default SkillsStep;
