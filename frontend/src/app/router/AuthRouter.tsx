import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import GuestGuard from "../../guards/GuestGuard";
import FallbackScreen from "../../components/ui/FallbackScreen";

const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../../features/auth/pages/RegisterPage"));
const OtpPage = lazy(() => import("../../features/auth/pages/OtpPage"));
const GoogleCallback = lazy(() => import("../../features/auth/pages/GoogleCallback"));
const ForgotPasswordPage = lazy(() => import("../../features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../../features/auth/pages/ResetPasswordPage"));

const AuthRouter = () => {
  return (
    <Suspense fallback={<FallbackScreen />}>
      <Routes>
        <Route
          path="login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />

        <Route
          path="signup"
          element={
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          }
        />

        <Route path="verify-otp" element={<OtpPage />} />

        <Route
          path="forgot-password"
          element={
            <GuestGuard>
              <ForgotPasswordPage />
            </GuestGuard>
          }
        />

        <Route
          path="reset-password"
          element={
            <GuestGuard>
              <ResetPasswordPage />
            </GuestGuard>
          }
        />

        <Route path="google/callback" element={<GoogleCallback />} />
      </Routes>
    </Suspense>
  );
};

export default AuthRouter;
