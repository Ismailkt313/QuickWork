import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import { updateField, setCurrentStep } from "../../store/onboardingSlice";

const IdentityStep: React.FC = () => {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.onboarding);
    const [imagePreview, setImagePreview] = useState<string | null>(formData.profileImage || null);

    const isValid =
        formData.profileImage &&
        formData.headline.trim().length > 0 &&
        formData.about.trim().length >= 80 &&
        formData.phone.trim().length > 0 &&
        formData.yearsOfExperience >= 0;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                dispatch(updateField({ field: "profileImage", value: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: any) => {
        dispatch(updateField({ field, value }));
    };

    const calculateProfileStrength = () => {
        let strength = 20; // Base strength
        if (formData.profileImage) strength += 20;
        if (formData.headline.trim()) strength += 20;
        if (formData.about.trim().length >= 80) strength += 20;
        if (formData.phone.trim()) strength += 20;
        return strength;
    };

    return (
        <div className="container py-3 py-md-5" style={{ maxWidth: "640px" }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <h4 className="fw-bold mb-4 text-center">Professional Identity</h4>

                 <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-secondary small fw-bold">Profile Strength</span>
                        <span className="text-primary small fw-bold">{calculateProfileStrength()}%</span>
                    </div>
                    <div className="progress" style={{ height: "8px" }}>
                        <div
                            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                            role="progressbar"
                            style={{ width: `${calculateProfileStrength()}%` }}
                        ></div>
                    </div>
                </div>

                <div className="row g-4">
                     <div className="col-12 text-center mb-3">
                        <div className="position-relative d-inline-block">
                            <div
                                className="rounded-circle bg-light border d-flex align-items-center justify-content-center overflow-hidden shadow-sm"
                                style={{ width: "120px", height: "120px" }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    <i className="bi bi-person text-secondary fs-1"></i>
                                )}
                            </div>
                            <label
                                htmlFor="profileImage"
                                className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 shadow"
                                style={{ width: "32px", height: "32px", padding: "0" }}
                            >
                                <i className="bi bi-camera"></i>
                                <input
                                    type="file"
                                    id="profileImage"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        <div className="mt-2 text-secondary small">Click the camera to upload a profile photo</div>
                    </div>

                     <div className="col-12">
                        <label className="form-label fw-bold small">Professional Headline</label>
                        <input
                            type="text"
                            className="form-control bg-light border-0"
                            placeholder="e.g. Master Plumber with 10+ Years Experience"
                            value={formData.headline}
                            onChange={(e) => handleInputChange("headline", e.target.value)}
                        />
                        <div className="form-text text-muted small">A short summary of what you do best.</div>
                    </div>

                     <div className="col-12">
                        <label className="form-label fw-bold small">About You</label>
                        <textarea
                            className="form-control bg-light border-0"
                            rows={4}
                            placeholder="Tell clients about your background, expertise, and what makes your service stand out..."
                            value={formData.about}
                            onChange={(e) => handleInputChange("about", e.target.value)}
                        ></textarea>
                        <div className="d-flex justify-content-between mt-1">
                            <span className={`small ${formData.about.length < 80 ? 'text-danger' : 'text-success'}`}>
                                {formData.about.length < 80 ? `Minimum 80 characters (${80 - formData.about.length} more needed)` : 'Perfect length!'}
                            </span>
                            <span className="text-muted small">{formData.about.length} chars</span>
                        </div>
                    </div>

                     <div className="col-sm-6">
                        <label className="form-label fw-bold small">Years of Experience</label>
                        <select
                            className="form-select bg-light border-0"
                            value={formData.yearsOfExperience}
                            onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value))}
                        >
                            {[...Array(21)].map((_, i) => (
                                <option key={i} value={i}>
                                    {i === 20 ? "20+" : i} {i === 1 ? "Year" : "Years"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-sm-6">
                        <label className="form-label fw-bold small">Phone Number</label>
                        <div className="input-group bg-light rounded-2 overflow-hidden">
                            <span className="input-group-text border-0 bg-transparent ps-3">
                                <i className="bi bi-telephone text-muted"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control border-0 bg-transparent ps-0"
                                placeholder="10-digit number"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                    <button
                        onClick={() => dispatch(setCurrentStep(0))}
                        className="btn btn-link text-secondary text-decoration-none fw-bold"
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back
                    </button>
                    <button
                        disabled={!isValid}
                        onClick={() => dispatch(setCurrentStep(2))}
                        className="btn btn-primary px-5 py-2 fw-bold rounded-pill shadow"
                    >
                        Next Step
                        <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IdentityStep;
