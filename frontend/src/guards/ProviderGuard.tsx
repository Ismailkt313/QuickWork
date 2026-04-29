import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  role: string;
  exp: number;
}

const ProviderGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const [authState, setAuthState] = useState<{
    isAuthorized: boolean;
    redirectPath: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!token) {
        setAuthState({
          isAuthorized: false,
          redirectPath: "/auth/login",
          message: "Please login to continue",
        });
        return;
      }

      try {
        const decoded: TokenPayload = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setAuthState({
            isAuthorized: false,
            redirectPath: "/auth/login",
            message: "Session expired. Please login again.",
          });
          return;
        }

        // Check role permissions based on current path
        if (
          decoded.role === "provider" &&
          location.pathname === "/provider/become-provider"
        ) {
          setAuthState({
            isAuthorized: false,
            redirectPath: "/provider/dashboard",
          });
          return;
        }

        if (
          decoded.role !== "provider" &&
          location.pathname === "/provider/dashboard"
        ) {
          setAuthState({
            isAuthorized: false,
            redirectPath: "/provider/become-provider",
            message: "Please complete provider onboarding first.",
          });
          return;
        }

        setAuthState({ isAuthorized: true, redirectPath: "" });
      } catch {
        localStorage.removeItem("token");
        setAuthState({
          isAuthorized: false,
          redirectPath: "/auth/login",
          message: "Invalid session. Please login again.",
        });
      }
    };

    checkAuth();
  }, [token, location.pathname]);

  if (!authState) return null;

  if (!authState.isAuthorized) {
    return (
      <Navigate
        to={authState.redirectPath}
        replace
        state={authState.message ? { message: authState.message } : undefined}
      />
    );
  }

  return <>{children}</>;
};

export default ProviderGuard;
