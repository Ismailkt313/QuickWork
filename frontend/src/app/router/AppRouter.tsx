import { BrowserRouter, Route, Routes } from "react-router-dom"

import LandingPage from "../../pages/LandingPage"
import LoginPage from "../../pages/LoginPage"
import RegisterPage from "../../pages/RegisterPage"
import OtpPage from "../../pages/OtpPage"
import AdminLoginPage from "../../admin/pages/AdminLoginPage"
import GoogleCallback from "../../pages/GoogleCallback"
import ForgotPasswordPage from "../../pages/ForgotPasswordPage"
import ResetPasswordPage from "../../pages/ResetPasswordPage"
import BecomeProviderPage from "../../pages/BecomeProviderPage"

import GuestGuard from "../../components/GuestGuard"
import AdminGuestGuard from "../../admin/components/AdminGuestGuard"
import AdminAuthGuard from "../../admin/components/AdminAuthGuard"
import AuthGuard from "../../components/AuthGuard"

import AdminLayout from "../../admin/components/AdminLayout"
import AdminDashboard from "../../admin/pages/AdminDashboard"
import UserManagement from "../../admin/pages/UserManagement"
import SkillRequests from "../../admin/pages/SkillRequests"

import ProviderSuccessPage from "../../features/providerOnboarding/components/ProviderSuccessPage"

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