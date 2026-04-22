import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

export const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="btn btn-link text-decoration-none text-secondary d-flex align-items-center px-0 py-2 fw-medium shadow-none"
      style={{ transition: "color 0.2s" }}
      onMouseOver={(e) => (e.currentTarget.style.color = "#0f172a")}
      onMouseOut={(e) => (e.currentTarget.style.color = "#6c757d")}
    >
      <FiArrowLeft className="me-2" size={18} />
      Back
    </button>
  );
};
