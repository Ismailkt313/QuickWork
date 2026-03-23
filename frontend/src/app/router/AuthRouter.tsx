import { Routes, Route } from "react-router-dom"

import LoginPage from "../../features/auth/pages/LoginPage"
import RegisterPage from "../../features/auth/pages/RegisterPage"
import OtpPage from "../../features/auth/pages/OtpPage"
import GoogleCallback from "../../features/auth/pages/GoogleCallback"
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage"
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage"

import GuestGuard from "../../guards/GuestGuard"

const AuthRouter = () => {
  return (
    <Routes>

      <Route path="login" element={
        <GuestGuard>
          <LoginPage />
        </GuestGuard>
      } />

      <Route path="signup" element={
        <GuestGuard>
          <RegisterPage />
        </GuestGuard>
      } />

      <Route path="verify-otp" element={<OtpPage />} />

      <Route path="forgot-password" element={
        <GuestGuard>
          <ForgotPasswordPage />
        </GuestGuard>
      } />

      <Route path="reset-password" element={
        <GuestGuard>
          <ResetPasswordPage />
        </GuestGuard>
      } />

      <Route path="google/callback" element={<GoogleCallback />} />

    </Routes>
  )
}

export default AuthRouter