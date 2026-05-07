import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../../../app/store";
import {
  setCurrentStep,
  setAgreedToTerms,
  resetOnboarding,
} from "../../../providerOnboarding/store/onboardingSlice";
import { submitProviderApplication } from "../../../../provider/services/provider.service";
import { toast } from "react-toastify";

const ReviewStep: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formData } = useSelector((state: RootState) => state.onboarding);

  const [isAccuracyConfirmed, setIsAccuracyConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    isAccuracyConfirmed &&
    formData.agreedToTerms &&
    formData.skills.length >= 1 &&
    formData.location !== null &&
    formData.portfolio.length >= 1;

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const mappedSkills = formData.skills
        .filter((s) => !s.id.startsWith("req_"))
        .map((s) => s.id);

      const payload = {
        headline: formData.headline,
        about: formData.about,
        profileImage: formData.profileImage || "https://placedog.net/500",
        skills: mappedSkills,
        yearsOfExperience: formData.yearsOfExperience,
        hourlyRate: formData.hourlyRate,
        location: formData.location!,
        portfolio: formData.portfolio.map((p) => ({
          title: p.title,
          description: p.description,
          images: p.images,
        })),
      };

      const result = await submitProviderApplication(payload);

      if (result.success && result.data?.accessToken) {
        localStorage.setItem("token", result.data.accessToken);

        dispatch(resetOnboarding());
        navigate("/provider/success");
      } else {
        dispatch(resetOnboarding());
        navigate("/provider/status");
        toast.success("Application submitted successfully!");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Submission failed";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-3 py-md-5" style={{ maxWidth: "800px" }}>
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
        <div className="text-center mb-5">
          <p className="text-primary fw-bold mb-2">Step 4 of 5</p>
          <h4 className="fw-bold">Review Your Application</h4>
          <p className="text-secondary small">
            Please review your details before submitting for verification.
          </p>
        </div>

        <div className="mb-4 bg-light rounded-4 p-4 border position-relative">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0 text-primary">Identity & Background</h6>
            <button
              onClick={() => dispatch(setCurrentStep(1))}
              className="btn btn-sm btn-link text-decoration-none fw-bold p-0 text-primary"
            >
              Edit Identity
            </button>
          </div>

          <div className="d-flex align-items-center gap-4">
            {formData.profileImage ? (
              <img
                src={formData.profileImage}
                alt="Profile"
                className="rounded-circle object-fit-cover shadow-sm border"
                style={{ width: "90px", height: "90px" }}
              />
            ) : (
              <div
                className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm border"
                style={{ width: "90px", height: "90px" }}
              >
                <i className="bi bi-person text-secondary fs-1"></i>
              </div>
            )}
            <div>
              <h5 className="fw-bold mb-1">
                {formData.headline || "Professional Service Provider"}
              </h5>
              <p className="text-muted small mb-2">
                {formData.yearsOfExperience} Years of Experience
              </p>
              <p className="text-muted small mb-0">
                <i className="bi bi-telephone-fill me-2"></i>{" "}
                {formData.phone.replace(/.(?=.{4})/g, "*") || "N/A"}
              </p>
            </div>
          </div>

          {formData.about && (
            <div className="mt-3 pt-3 border-top">
              <p className="text-secondary small mb-0 lh-sm">
                "{formData.about}"
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 bg-light rounded-4 p-4 border">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0 text-primary">Skills & Service Area</h6>
            <button
              onClick={() => dispatch(setCurrentStep(2))}
              className="btn btn-sm btn-link text-decoration-none fw-bold p-0 text-primary"
            >
              Edit Skills
            </button>
          </div>

          <div className="row g-3">
            <div className="col-sm-6">
              <p className="text-muted small fw-bold mb-1">Expertise</p>
              <div className="d-flex flex-wrap gap-1">
                {formData.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="badge bg-primary bg-opacity-10 text-primary rounded-pill fw-normal"
                  >
                    {skill.name}
                  </span>
                ))}
                {formData.skills.length === 0 && (
                  <span className="text-danger small">Required</span>
                )}
              </div>
            </div>
            <div className="col-sm-6 text-sm-end">
              <p className="text-muted small fw-bold mb-1">Hourly Rate</p>
              <p className="fw-bold fs-5 mb-0 text-dark">
                ₹{formData.hourlyRate}
                <span className="text-muted fw-normal fs-6">/hr</span>
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-top d-flex align-items-center gap-2">
            <i className="bi bi-geo-alt-fill text-primary"></i>
            <span className="fw-medium text-dark">
              {formData.location?.name || (
                <span className="text-danger">Location Required</span>
              )}
            </span>
          </div>
        </div>

        <div className="mb-4 bg-light rounded-4 p-4 border">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0 text-primary">Portfolio Projects</h6>
            <button
              onClick={() => dispatch(setCurrentStep(3))}
              className="btn btn-sm btn-link text-decoration-none fw-bold p-0 text-primary"
            >
              Edit Portfolio
            </button>
          </div>

          {formData.portfolio.length === 0 ? (
            <p className="text-danger small mb-0">
              At least 1 project is required.
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {formData.portfolio.map((project, idx) => (
                <div
                  key={project.id}
                  className={
                    idx !== formData.portfolio.length - 1
                      ? "border-bottom pb-3"
                      : ""
                  }
                >
                  <h6 className="fw-bold mb-1">{project.title}</h6>
                  {project.description && (
                    <p className="text-secondary small mb-2 lh-sm">
                      {project.description}
                    </p>
                  )}
                  <div className="d-flex gap-2">
                    {project.images.slice(0, 3).map((img, imgIdx) => (
                      <img
                        key={imgIdx}
                        src={img}
                        alt="Preview"
                        className="rounded-3 border object-fit-cover shadow-sm"
                        style={{ width: "60px", height: "60px" }}
                      />
                    ))}
                    {project.images.length > 3 && (
                      <div
                        className="rounded-3 border bg-white text-secondary d-flex align-items-center justify-content-center fw-bold small shadow-sm"
                        style={{ width: "60px", height: "60px" }}
                      >
                        +{project.images.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-primary bg-opacity-10 rounded-4 p-4 border border-primary border-opacity-25 mt-4">
          <h6 className="fw-bold mb-3 text-primary">
            Agreement & Verification
          </h6>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="accuracyCheck"
              checked={isAccuracyConfirmed}
              onChange={(e) => setIsAccuracyConfirmed(e.target.checked)}
            />
            <label
              className="form-check-label text-dark small"
              htmlFor="accuracyCheck"
            >
              I confirm that the information provided is accurate and truthfully
              represents my professional background.
            </label>
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="termsCheck"
              checked={formData.agreedToTerms}
              onChange={(e) => dispatch(setAgreedToTerms(e.target.checked))}
            />
            <label
              className="form-check-label text-dark small"
              htmlFor="termsCheck"
            >
              I agree to QuickWork's service guidelines and understand that my
              profile is subject to approval.
            </label>
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-5 pt-4 border-top gap-3">
          <button
            onClick={() => dispatch(setCurrentStep(3))}
            className="btn btn-link text-secondary text-decoration-none fw-bold order-2 order-sm-1"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back
          </button>

          <div className="d-flex flex-column align-items-center align-items-sm-end order-1 order-sm-2 w-100">
            <button
              disabled={!isValid || isSubmitting}
              onClick={handleSubmit}
              className="btn btn-primary px-5 py-3 fw-bold rounded-pill shadow w-100 w-sm-auto mb-2"
            >
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
              {!isSubmitting && <i className="bi bi-check-circle ms-2"></i>}
            </button>
            <span className="text-success small fw-medium mt-1">
              <i className="bi bi-info-circle me-1"></i>
              Your profile will be reviewed within 24–48 hours.
            </span>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
                .w-sm-auto {
                    @media (min-width: 576px) {
                        width: auto !important;
                    }
                }
            `,
        }}
      />
    </div>
  );
};

export default ReviewStep;
