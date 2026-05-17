import React, { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumb,
}) => {
  return (
    <>
      {breadcrumb && <div className="admin-breadcrumb">{breadcrumb}</div>}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </>
  );
};
