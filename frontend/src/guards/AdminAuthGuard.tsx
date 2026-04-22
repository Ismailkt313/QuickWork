import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface AdminAuthGuardProps {
  children: ReactNode;
}

const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const adminToken = localStorage.getItem("adminAccessToken");

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
