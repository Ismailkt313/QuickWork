import React, { useState } from "react";
import {
  RiCloseLine,
  RiSaveLine,
  RiCheckboxCircleLine,
  RiAddCircleLine,
} from "react-icons/ri";
import { updateProviderProfile } from "../services/provider.service";
import { toast } from "react-toastify";
import "./Modals.css";

interface Skill {
  id: string;
  _id?: string;
  name: string;
}

interface EditSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentSkills: Skill[];
  allSkills: Skill[];
}

const EditSkillsModal: React.FC<EditSkillsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentSkills,
  allSkills,
}) => {
  console.log(currentSkills, "currentSkills in edit skills modal");
  console.log(allSkills, "allSkills in edit skills modal");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    currentSkills.map((s) => s.id || s._id),
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSkill = (id: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (selectedSkillIds.length === 0) {
      toast.warning("Please select at least one skill");
      return;
    }

    setLoading(true);
    try {
      const response = await updateProviderProfile({
        skills: selectedSkillIds,
      });
      if (response.success) {
        toast.success("Skills updated successfully");
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update skills";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredSkills = allSkills.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="qw-modal-backdrop animate__animated animate__fadeIn">
      <div className="qw-modal-content edit-skills p-4 animate__animated animate__zoomIn">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="qw-h2 m-0 text-primary">Edit My Skills</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            className="form-control qw-input"
            placeholder="Search for skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="qw-skills-grid mb-4">
          {filteredSkills.map((skill) => {
            const isSelected = selectedSkillIds.includes(skill.id || skill._id);
            return (
              <div
                key={skill.id || skill._id}
                className={`qw-skill-option p-3 ${isSelected ? "selected" : ""}`}
                onClick={() => toggleSkill(skill.id || skill._id)}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <span className="fw-600">{skill.name}</span>
                  {isSelected ? (
                    <RiCheckboxCircleLine className="text-success" size={20} />
                  ) : (
                    <RiAddCircleLine className="text-muted" size={20} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="d-flex gap-3 mt-4 pt-3 border-top">
          <div className="flex-grow-1 align-self-center text-muted small">
            {selectedSkillIds.length} skills selected
          </div>
          <button
            type="button"
            className="btn btn-light rounded-pill px-4"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <RiSaveLine />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSkillsModal;
