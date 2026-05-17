import React, { type ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
  actionButton?: {
    label: string;
    icon?: string;
    onClick: () => void | Promise<void>;
  };
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumb,
  actionButton,
}) => {
  return (
    <>
      {breadcrumb && <div className="admin-breadcrumb">{breadcrumb}</div>}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
        </div>
        {(action || actionButton) && (
          <div className="d-flex gap-2">
            {action}
            {actionButton && (
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={actionButton.onClick}
              >
                {actionButton.icon && <i className={actionButton.icon}></i>}
                {actionButton.label}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};
