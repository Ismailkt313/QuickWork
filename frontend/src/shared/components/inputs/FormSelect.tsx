import React from "react";
import { CustomSelect, type SelectOption } from "../ui/CustomSelect";

export type { SelectOption };

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  icon,
  required,
  placeholder,
  disabled,
  size = "md",
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "#334155",
          marginBottom: 8,
        }}
      >
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>

      <CustomSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder ?? `Select ${label}…`}
        icon={icon}
        disabled={disabled}
        size={size}
        error={!!error}
        fullWidth
      />

      {error && (
        <p style={{ marginTop: 6, fontSize: "0.8125rem", color: "#ef4444", fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
};
