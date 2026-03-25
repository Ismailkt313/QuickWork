import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
    suffix?: React.ReactNode;
    required?: boolean;
    helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    error,
    icon,
    suffix,
    required,
    helperText,
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
                <input
                    className={`form-control ${icon ? 'border-start-0 px-2' : ''} ${suffix ? 'border-end-0' : ''} ${error ? 'is-invalid border-danger' : ''} ${className || ''}`}
                    style={{ boxShadow: 'none' }}
                    {...props}
                />
                {suffix && (
                    <span className="input-group-text bg-white text-muted fw-semibold border-start-0 px-3">
                        {suffix}
                    </span>
                )}
                {error && <div className="invalid-feedback d-block mt-1">{error}</div>}
                {!error && helperText && <div className="form-text mt-1 small text-muted">{helperText}</div>}
            </div>
        </div>
    );
};
