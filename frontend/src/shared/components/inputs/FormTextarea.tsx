import React from "react";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  icon,
  required,
  maxLength,
  className,
  value,
  ...props
}) => {
  const currentLength = String(value || "").length;

  return (
    <div className="mb-4">
      <label className="form-label fw-semibold text-dark small mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="position-relative">
        {icon && (
          <div className="position-absolute pt-3 ps-3 text-muted">{icon}</div>
        )}
        <textarea
          className={`form-control ${icon ? "ps-5" : ""} ${error ? "is-invalid border-danger" : ""} ${className || ""}`}
          style={{ boxShadow: "none" }}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {error && <div className="invalid-feedback d-block mt-1">{error}</div>}
      </div>
      {maxLength && (
        <div className="d-flex justify-content-end align-items-center mt-1">
          <small
            className={`fw-medium ${currentLength >= maxLength ? "text-danger" : "text-muted"}`}
          >
            {currentLength} / {maxLength}
          </small>
        </div>
      )}
    </div>
  );
};
