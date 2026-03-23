import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

interface TokenPayload {
  role: string;
  exp: number;
}

const ProviderGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

 if (!token) {
  return (
    <Navigate
      to="/auth/login"
      replace
      state={{ message: "Please login to continue" }}
    />
  )
}

  try {
    const decoded: TokenPayload = jwtDecode(token);

    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");

      if (!toast.isActive("session-expired")) {
        toast.error("Session expired. Please login again.", { toastId: "session-expired" });
      }

      return <Navigate to="/auth/login" replace />;
    }

    if (decoded.role === "provider" && location.pathname === "/provider/become-provider") {
      if (!toast.isActive("already-provider")) {
        toast.info("You are already a provider. Redirecting to dashboard.", {
          toastId: "already-provider"
        });
      }

      return <Navigate to="/provider/dashboard" replace />;
    }

    if (decoded.role !== "provider" && location.pathname === "/provider/dashboard") {
      if (!toast.isActive("complete-onboarding")) {
        toast.warning("Please complete provider onboarding first.", {
          toastId: "complete-onboarding"
        });
      }

      return <Navigate to="/provider/become-provider" replace />;
    }

  } catch {
    localStorage.removeItem("token");

    if (!toast.isActive("invalid-session")) {
      toast.error("Invalid session. Please login again.", {
        toastId: "invalid-session"
      });
    }

    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProviderGuard;