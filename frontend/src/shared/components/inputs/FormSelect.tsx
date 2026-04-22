import React from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  error,
  icon,
  required,
  placeholder,
  className,
  ...props
}) => {
  return (
    <div className="mb-4">
      <label className="form-label fw-semibold text-dark small mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-light text-secondary border-end-0 px-3">
            {icon}
          </span>
        )}
        <select
          className={`form-select ${icon ? "border-start-0 px-2" : ""} ${error ? "is-invalid border-danger" : ""} ${className || ""}`}
          style={{ boxShadow: "none" }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <div className="invalid-feedback d-block mt-1">{error}</div>}
      </div>
    </div>
  );
};
