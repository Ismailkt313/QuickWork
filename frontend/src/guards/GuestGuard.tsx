import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface GuestGuardProps {
    children: ReactNode;
    redirectTo?: string;
}

const GuestGuard = ({ children, redirectTo = "/" }: GuestGuardProps) => {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default GuestGuard;
