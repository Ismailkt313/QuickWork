import { BrowserRouter, Route, Routes } from "react-router-dom";

import LandingPage from "../../features/user/landingPage/page/LandingPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import OtpPage from "../../features/auth/pages/OtpPage";
import AdminLoginPage from "../../features/admin/pages/AdminLoginPage";
import GoogleCallback from "../../features/auth/pages/GoogleCallback";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import BecomeProviderPage from "../../features/provider/pages/BecomeProviderPage";

import GuestGuard from "../../guards/GuestGuard";
import AdminGuestGuard from "../../guards/AdminGuestGuard";
import AdminAuthGuard from "../../guards/AdminAuthGuard";
import AuthGuard from "../../guards/AuthGurad";

import AdminLayout from "../../features/admin/components/AdminLayout";
import AdminDashboard from "../../features/admin/pages/AdminDashboard";
import UserManagement from "../../features/admin/pages/UserManagement";
import AdminJobsPage from "../../features/admin/pages/AdminJobsPage";
import AdminJobDetailPage from "../../features/admin/pages/AdminJobDetailPage";
import AdminReportsPage from "../../features/admin/pages/AdminReportsPage";
import SkillRequests from "../../features/admin/pages/SkillRequests";

import ProviderSuccessPage from "../../features/provider/providerOnboarding/components/ProviderSuccessPage";
import UserRouter from "./UserRouter";
import ProviderRouter from "./ProviderRouter";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/auth/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />

        <Route
          path="/auth/signup"
          element={
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          }
        />

        <Route path="/auth/verify-otp" element={<OtpPage />} />

        <Route
          path="/auth/forgot-password"
          element={
            <GuestGuard>
              <ForgotPasswordPage />
            </GuestGuard>
          }
        />

        <Route
          path="/auth/reset-password"
          element={
            <GuestGuard>
              <ResetPasswordPage />
            </GuestGuard>
          }
        />

        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        <Route
          path="/admin/login"
          element={
            <AdminGuestGuard>
              <AdminLoginPage />
            </AdminGuestGuard>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              <AdminLayout />
            </AdminAuthGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="jobs" element={<AdminJobsPage />} />
          <Route path="jobs/:jobId" element={<AdminJobDetailPage />} />
          <Route path="jobs/disputes" element={<AdminReportsPage />} />
          <Route path="jobs/flagged" element={<AdminJobsPage defaultType="flagged" />} />
          <Route path="jobs/payments" element={<AdminJobsPage defaultType="payments" />} />
          <Route path="jobs/stalled" element={<AdminJobsPage defaultType="stalled" />} />
          <Route path="skill-requests" element={<SkillRequests />} />
        </Route>

        <Route
          path="/provider/become-provider"
          element={
            <AuthGuard>
              <BecomeProviderPage />
            </AuthGuard>
          }
        />

        <Route
          path="/provider/status"
          element={
            <AuthGuard>
              <ProviderSuccessPage />
            </AuthGuard>
          }
        />

        <Route
          path="/user/*"
          element={
            <AuthGuard>
              <UserRouter />
            </AuthGuard>
          }
        />

        <Route
          path="/provider/*"
          element={
            <AuthGuard>
              <ProviderRouter />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
