import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface AdminGuestGuardProps {
    children: ReactNode;
    redirectTo?: string;
}

const AdminGuestGuard = ({ children, redirectTo = "/admin" }: AdminGuestGuardProps) => {
    const adminToken = localStorage.getItem("adminAccessToken");

    if (adminToken) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default AdminGuestGuard;
