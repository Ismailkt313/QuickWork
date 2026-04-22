import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

const AuthGuard = ({
  children,
  redirectTo = "/auth/login",
}: AuthGuardProps) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <Navigate to={redirectTo} replace state={{ fromRestricted: true }} />
    );
  }
  return <>{children}</>;
};

export default AuthGuard;
