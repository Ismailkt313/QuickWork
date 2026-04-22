import React, { useState, useEffect, useCallback } from "react";
import {
  RiCloseLine,
  RiSearchLine,
  RiAddCircleLine,
  RiInformationLine,
} from "react-icons/ri";
import {
  searchSkills,
  requestSkill,
} from "../../user/serviceProviders/services/skills.service";
import { debounce } from "../../../utils/debounce";
import { toast } from "react-toastify";
import "./Modals.css";

interface RequestSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestSkillModal: React.FC<RequestSkillModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [skillQuery, setSkillQuery] = useState("");
  const [skillResults, setSkillResults] = useState<
    { id: string; name: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSkills = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSkillResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const results = await searchSkills(query);
      setSkillResults(results);
      setIsSearching(false);
    }, 280),
    [],
  );

  useEffect(() => {
    if (skillQuery.trim()) {
      setIsSearching(true);
      fetchSkills(skillQuery);
    } else {
      setSkillResults([]);
      setIsSearching(false);
    }
  }, [skillQuery, fetchSkills]);

  const handleRequest = async () => {
    if (!skillQuery.trim()) return;

    setLoading(true);
    try {
      const result = await requestSkill(skillQuery);
      if (result.success) {
        toast.success(
          `Successfully requested "${skillQuery}". Admin will review it soon.`,
        );
        setSkillQuery("");
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to request skill");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="qw-modal-backdrop animate__animated animate__fadeIn">
      <div className="qw-modal-content edit-profile p-4 animate__animated animate__zoomIn">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary-subtle p-2 rounded-3 text-primary">
              <RiAddCircleLine size={24} />
            </div>
            <h2 className="qw-h2 m-0">Request New Skill</h2>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div
            className="alert alert-info border-0 rounded-4 d-flex gap-3 align-items-start mb-4"
            style={{ background: "#f0f9ff" }}
          >
            <RiInformationLine className="text-primary mt-1" size={20} />
            <div className="small text-primary">
              <p className="mb-1 fw-bold">How it works:</p>
              <p className="mb-0 opacity-75">
                Suggest a skill you'd like to add to your profile. Our team will
                review and add it to our platform if it's a good fit.
              </p>
            </div>
          </div>

          <label className="form-label fw-bold small text-muted text-uppercase mb-2">
            Skill Name
          </label>
          <div className="position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">
              <RiSearchLine />
            </span>
            <input
              type="text"
              className="form-control qw-input ps-5"
              placeholder="e.g. Specialized Welding, Piano Tutoring..."
              value={skillQuery}
              onChange={(e) => setSkillQuery(e.target.value)}
              disabled={loading}
            />
            {isSearching && (
              <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                />
              </div>
            )}
          </div>
        </div>

        {skillQuery.trim() && !isSearching && (
          <div className="mb-4">
            {skillResults.length > 0 ? (
              <div className="p-3 rounded-4 border bg-light">
                <p className="small text-muted mb-3">
                  Similar skills already exist:
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {skillResults.slice(0, 5).map((s) => (
                    <span
                      key={s.id}
                      className="badge bg-white text-primary border px-3 py-2 rounded-pill shadow-sm"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
                <p className="small text-muted mt-3 mb-0">
                  If your skill is different, feel free to request it
                  regardless.
                </p>
              </div>
            ) : (
              <div
                className="text-center p-4 rounded-4 border-dashed"
                style={{ border: "2px dashed #e2e8f0" }}
              >
                <p className="text-muted mb-0">
                  Good news! "{skillQuery}" is unique to our platform.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="d-flex gap-3 pt-3 border-top">
          <button
            type="button"
            className="btn btn-light rounded-pill px-4 flex-grow-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 flex-grow-1 d-flex align-items-center justify-content-center gap-2"
            onClick={handleRequest}
            disabled={loading || !skillQuery.trim()}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <RiAddCircleLine />
            )}
            Request Skill
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestSkillModal;
