import { Routes, Route } from "react-router-dom"

import LoginPage from "../../pages/LoginPage"
import RegisterPage from "../../pages/RegisterPage"
import OtpPage from "../../pages/OtpPage"
import GoogleCallback from "../../pages/GoogleCallback"
import ForgotPasswordPage from "../../pages/ForgotPasswordPage"
import ResetPasswordPage from "../../pages/ResetPasswordPage"

import GuestGuard from "../../components/GuestGuard"

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