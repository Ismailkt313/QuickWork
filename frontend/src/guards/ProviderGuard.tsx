import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getMe } from "../features/auth/services/authApi";
import { providerService } from "../features/provider/services/provider.service";
import { VERIFICATION_STATUS } from "../constants/verification";
import { ROLES } from "../constants/roles";
import FallbackScreen from "../components/ui/FallbackScreen";

interface TokenPayload {
  role: string;
  exp: number;
}

const ProviderGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [providerState, setProviderState] = useState<{
    isProvider: boolean;
    verificationStatus?: string;
    isBlocked?: boolean;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      if (!token) {
        setProviderState(null);
        setLoading(false);
        return;
      }

      try {
        const decoded: TokenPayload = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setProviderState(null);
          setLoading(false);
          return;
        }

        const profileRes = await getMe();
        if (!profileRes.success || profileRes.data.isBlocked) {
          localStorage.removeItem("token");
          setProviderState({ isProvider: false, isBlocked: profileRes.data?.isBlocked });
          setLoading(false);
          return;
        }

        const user = profileRes.data;
        const isProvider = user.role === ROLES.PROVIDER;

        if (isProvider) {
          setProviderState({ isProvider: true, verificationStatus: "approved" });
        } else {

          try {
            const providerProfileRes = await providerService.getMyProfile<{ verificationStatus?: string }>();
            const status = providerProfileRes.data?.verificationStatus;
            setProviderState({ isProvider: false, verificationStatus: status });
          } catch {

            setProviderState({ isProvider: false, verificationStatus: undefined });
          }
        }
      } catch {
        localStorage.removeItem("token");
        setProviderState(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  if (loading || providerState === undefined) return <FallbackScreen />;

  if (!token || providerState === null) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ message: "Please login to continue" }}
      />
    );
  }

  if (providerState.isBlocked) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ message: "Your account has been blocked." }}
      />
    );
  }

  const isAccessingOnboarding = location.pathname.includes("/provider/become-provider");
  const isAccessingStatus = location.pathname.includes("/provider/success") || location.pathname.includes("/provider/status");

  if (providerState.isProvider) {
    if (isAccessingOnboarding || isAccessingStatus) {
      return <Navigate to="/provider/dashboard" replace />;
    }
    return <>{children}</>;
  }

  const status = providerState.verificationStatus;

  if (status === VERIFICATION_STATUS.REJECTED) {
    if (!isAccessingOnboarding) {
      return <Navigate to="/provider/become-provider" replace />;
    }
    return <>{children}</>;
  }

  if (status === VERIFICATION_STATUS.PENDING) {
    if (!isAccessingStatus) {
      return <Navigate to="/provider/status" replace />;
    }
    return <>{children}</>;
  }

  if (!isAccessingOnboarding) {
    return (
      <Navigate
        to="/provider/become-provider"
        replace
        state={{ message: "Please complete provider onboarding first." }}
      />
    );
  }

  return <>{children}</>;
};

export default ProviderGuard;
