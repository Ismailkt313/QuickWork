import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import {
    setCurrentStep,
    addPortfolioProject,
    removePortfolioProject,
    updatePortfolioProject,
    addPortfolioImage,
    removePortfolioImage
} from "../../../providerOnboarding/store/onboardingSlice";
import { api } from "../../../../../services/api";

const PortfolioStep: React.FC = () => {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.onboarding);

    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const [uploadingProjects, setUploadingProjects] = useState<{ [key: string]: boolean }>({});

    const isValid = formData.portfolio.length >= 1 &&
        formData.portfolio.every(p => p.title.trim() !== "" && p.images.length >= 1) &&
        !Object.values(uploadingProjects).some(v => v);

    const handleAddProject = () => {
        dispatch(addPortfolioProject({
            id: `proj_${Date.now()}`,
            title: "",
            description: "",
            images: [],
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingProjects(prev => ({ ...prev, [projectId]: true }));

        try {
            for (const file of Array.from(files)) {
                if (file.size > 2 * 1024 * 1024) {
                    alert(`File "${file.name}" exceeds 2MB limit and was skipped.`);
                    continue;
                }

                const uploadData = new FormData();
                uploadData.append("image", file);

                const response = await api.post("/upload/portfolio-image", uploadData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                const imageUrl = response.data.data.imageUrl;
                dispatch(addPortfolioImage({ projectId, image: imageUrl }));
            }
        } catch (error: any) {
            console.error("Portfolio image upload failed", error);
            alert(error.response?.data?.message || "Failed to upload image.");
        } finally {
            setUploadingProjects(prev => ({ ...prev, [projectId]: false }));
        }

        if (fileInputRefs.current[projectId]) {
            fileInputRefs.current[projectId]!.value = "";
        }
    };

    return (
        <div className="container py-3 py-md-5" style={{ maxWidth: "700px" }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
                <div className="text-center mb-4">
                    <p className="text-primary fw-bold mb-2">Step 3 of 5</p>
                    <h4 className="fw-bold">Showcase Your Work</h4>
                    <p className="text-secondary small">Clients are more likely to hire providers with real project examples.</p>
                </div>

                <div className="mb-4">
                    {formData.portfolio.map((project, index) => (
                        <div key={project.id} className="card border shadow-sm rounded-4 mb-4 position-relative">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold mb-0">Project {index + 1}</h6>
                                    <button
                                        onClick={() => dispatch(removePortfolioProject(project.id))}
                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                        title="Remove Project"
                                    >
                                        <i className="bi bi-trash"></i> Remove
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold small">Project Title <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control bg-light border-0"
                                        placeholder="e.g. Modern Kitchen Plumbing"
                                        value={project.title}
                                        onChange={(e) => dispatch(updatePortfolioProject({ ...project, title: e.target.value }))}
                                    />
                                    <div className="form-text small mt-1">Give your project a clear, descriptive name.</div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold small">Description (Optional)</label>
                                    <textarea
                                        className="form-control bg-light border-0"
                                        rows={3}
                                        placeholder="Briefly describe what you did..."
                                        value={project.description}
                                        onChange={(e) => dispatch(updatePortfolioProject({ ...project, description: e.target.value }))}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="form-label fw-bold small">Images <span className="text-danger">*</span></label>
                                    <div className="d-flex flex-wrap gap-2 mb-2">
                                        {project.images.map((img, imgIdx) => (
                                            <div key={imgIdx} className="position-relative" style={{ width: "80px", height: "80px" }}>
                                                <img src={img} alt="Preview" className="w-100 h-100 object-fit-cover rounded-3 border" />
                                                <button
                                                    className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 translate-middle p-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: "20px", height: "20px" }}
                                                    onClick={() => dispatch(removePortfolioImage({ projectId: project.id, imageIndex: imgIdx }))}
                                                >
                                                    <i className="bi bi-x" style={{ fontSize: "14px" }}></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="d-none"
                                        ref={(el) => { fileInputRefs.current[project.id] = el; }}
                                        onChange={(e) => handleImageUpload(e, project.id)}
                                    />
                                    <button
                                        className="btn btn-sm btn-light border d-flex align-items-center gap-2"
                                        onClick={() => fileInputRefs.current[project.id]?.click()}
                                        disabled={uploadingProjects[project.id]}
                                    >
                                        {uploadingProjects[project.id] ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm text-primary"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-image text-primary"></i> Upload Images
                                            </>
                                        )}
                                    </button>
                                    {project.images.length === 0 && (
                                        <div className="form-text text-danger small mt-1">At least 1 image is required.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        className="btn btn-outline-primary rounded-pill w-100 py-2 fw-bold"
                        onClick={handleAddProject}
                    >
                        + Add Project
                    </button>
                </div>

                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                    <button
                        onClick={() => dispatch(setCurrentStep(2))}
                        className="btn btn-link text-secondary text-decoration-none fw-bold"
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back
                    </button>
                    <button
                        disabled={!isValid}
                        onClick={() => dispatch(setCurrentStep(4))}
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

export default PortfolioStep;
