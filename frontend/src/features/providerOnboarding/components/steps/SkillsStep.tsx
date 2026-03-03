import { useState, useEffect, useCallback } from "react";
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

    const [locationQuery, setLocationQuery] = useState(formData.location?.name || "");
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    // const isValid =
    //     (formData.skills?.length || 0) >= 1 &&
    //     (formData.hourlyRate || 0) > 0 &&
    //     formData.location !== null;

    const fetchSkills = useCallback(
        debounce(async (query: string) => {
            if (!query) {
                setSkillResults([]);
                return;
            }
            setIsSearchingSkills(true);
            const results = await searchSkills(query);
            setSkillResults(results);
            setIsSearchingSkills(false);
        }, 300),
        []
    );

    useEffect(() => {
        fetchSkills(skillQuery);
    }, [skillQuery, fetchSkills]);

    const handleAddSkill = (skill: { id: string; name: string }) => {
        dispatch(addSkill(skill));
        setSkillQuery("");
        setSkillResults([]);
    };

    const handleRequestSkill = async () => {
        if (!skillQuery) return;
        const result = await requestSkill(skillQuery);
        if (result.success) {
            dispatch(addSkill({ id: `req_${Date.now()}`, name: skillQuery, isRequested: true }));
            setSkillQuery("");
            setSkillResults([]);
        }
    };

    // --- Location Logic ---
    const fetchLocations = useCallback(
        debounce(async (query: string) => {
            if (query.length < 3) {
                setLocationResults([]);
                return;
            }
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
        } catch (error) {
            console.error("Failed to select location", error);
            alert("Failed to save location. Please try again.");
            setLocationQuery("");
            dispatch(setLocation(null));
        } finally {
            setIsSearchingLocation(false);
        }
    };

    return (
        <div className="container py-3 py-md-5" style={{ maxWidth: "680px" }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <div className="text-center mb-4">
                    <h4 className="fw-bold">Define Your Expertise & Service Area</h4>
                    <p className="text-secondary small">Help clients understand what you offer and where you work.</p>
                </div>

                <div className="row g-4">
                    {/* Skills Section */}
                    <div className="col-12">
                        <label className="form-label fw-bold small">Skills & Expertise</label>
                        <div className="position-relative">
                            <div className="input-group bg-light rounded-2 overflow-hidden mb-2">
                                <span className="input-group-text border-0 bg-transparent ps-3">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent ps-0"
                                    placeholder="Search skills (e.g. Plumbing, Cleaning)"
                                    value={skillQuery}
                                    onChange={(e) => setSkillQuery(e.target.value)}
                                    disabled={(formData.skills?.length || 0) >= 10}
                                />
                            </div>

                            {skillQuery && (
                                <div className="list-group position-absolute w-100 z-3 shadow-sm rounded-3 overflow-hidden border">
                                    {skillResults.map(skill => (
                                        <button
                                            key={skill.id}
                                            className="list-group-item list-group-item-action border-0 py-2 small"
                                            onClick={() => handleAddSkill(skill)}
                                        >
                                            {skill.name}
                                        </button>
                                    ))}
                                    {!isSearchingSkills && skillResults.length === 0 && (
                                        <div className="list-group-item border-0 py-3 text-center small bg-white">
                                            <p className="mb-2 text-muted">No matching skills found</p>
                                            <button
                                                className="btn btn-sm btn-outline-primary rounded-pill"
                                                onClick={handleRequestSkill}
                                            >
                                                Request "{skillQuery}" as a skill
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {formData.skills?.map(skill => (
                                <span
                                    key={skill.name}
                                    className={`badge rounded-pill d-flex align-items-center gap-2 py-2 px-3 border ${skill.isRequested ? 'bg-light text-primary border-primary border-opacity-25' : 'bg-primary bg-opacity-10 text-primary border-transparent'
                                        }`}
                                >
                                    {skill.name}
                                    {skill.isRequested && <i className="bi bi-clock small" title="Pending Approval"></i>}
                                    <i
                                        className="bi bi-x-circle-fill cursor-pointer opacity-50 hover-opacity-100"
                                        onClick={() => dispatch(removeSkill(skill.name))}
                                    ></i>
                                </span>
                            ))}
                        </div>
                        <div className="form-text text-muted small mt-2">
                            {(formData.skills?.length || 0)}/10 skills • Min 1 required
                        </div>
                    </div>

                    {/* Hourly Rate */}
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

                    {/* Location */}
                    <div className="col-12">
                        <label className="form-label fw-bold small">Primary Service Area</label>
                        <div className="position-relative">
                            <div className="input-group bg-light rounded-2 overflow-hidden shadow-sm">
                                <span className="input-group-text border-0 bg-transparent ps-3">
                                    <i className="bi bi-geo-alt text-muted"></i>
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
                                        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                    </span>
                                )}
                            </div>

                            {showLocationDropdown && locationResults.length > 0 && (
                                <div className="list-group position-absolute w-100 z-3 shadow rounded-3 overflow-hidden border mt-1">
                                    {locationResults.map((loc, idx) => (
                                        <button
                                            key={idx}
                                            className="list-group-item list-group-item-action border-0 py-3 small text-start"
                                            onClick={() => handleSelectLocation(loc)}
                                        >
                                            <i className="bi bi-geo-alt me-2 text-muted"></i>
                                            {loc.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                    <button
                        onClick={() => dispatch(setCurrentStep(1))}
                        className="btn btn-link text-secondary text-decoration-none fw-bold"
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back
                    </button>
                    <button
                        // disabled={!isValid}
                        onClick={() => dispatch(setCurrentStep(3))}
                        className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow"
                    >
                        Review & Next
                        <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .cursor-pointer { cursor: pointer; }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .list-group-item-action:hover { background-color: #f8f9fa; }
                input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
            `}} />
        </div>
    );
};

export default SkillsStep;



