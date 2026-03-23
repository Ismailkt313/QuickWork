import { BrowserRouter, Route, Routes } from "react-router-dom"

import LandingPage from "../../features/user/landingPage/page/LandingPage"
import LoginPage from "../../features/auth/pages/LoginPage"
import RegisterPage from "../../features/auth/pages/RegisterPage"
import OtpPage from "../../features/auth/pages/OtpPage"
import AdminLoginPage from "../../features/admin/pages/AdminLoginPage"
import GoogleCallback from "../../features/auth/pages/GoogleCallback"
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage"
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage"
import BecomeProviderPage from "../../features/provider/pages/BecomeProviderPage"

import GuestGuard from "../../guards/GuestGuard"
import AdminGuestGuard from "../../guards/AdminGuestGuard"
import AdminAuthGuard from "../../guards/AdminAuthGuard"
import AuthGuard from "../../guards/AuthGurad"

import AdminLayout from "../../features/admin/components/AdminLayout"
import AdminDashboard from "../../features/admin/pages/AdminDashboard"
import UserManagement from "../../features/admin/pages/UserManagement"
import SkillRequests from "../../features/admin/pages/SkillRequests"

import ProviderSuccessPage from "../../features/provider/providerOnboarding/components/ProviderSuccessPage"

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/auth/login" element={
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        } />

        <Route path="/auth/signup" element={
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        } />

        <Route path="/auth/verify-otp" element={<OtpPage />} />

        <Route path="/auth/forgot-password" element={
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        } />

        <Route path="/auth/reset-password" element={
          <GuestGuard>
            <ResetPasswordPage />
          </GuestGuard>
        } />

        <Route path="/auth/google/callback" element={<GoogleCallback />} />

        <Route path="/admin/login" element={
          <AdminGuestGuard>
            <AdminLoginPage />
          </AdminGuestGuard>
        } />

        <Route path="/admin" element={
          <AdminAuthGuard>
            <AdminLayout />
          </AdminAuthGuard>
        }>

          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="skill-requests" element={<SkillRequests />} />

        </Route>

        <Route path="/provider/become-provider" element={
          <AuthGuard>
            <BecomeProviderPage />
          </AuthGuard>
        } />

        <Route path="/provider/status" element={
          <AuthGuard>
            <ProviderSuccessPage />
          </AuthGuard>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter