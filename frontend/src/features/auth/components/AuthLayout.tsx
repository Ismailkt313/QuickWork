import React from "react";
import AuthNavbar from "./AuthNavbar";

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: "/auth/login" | "/auth/signup" | "/auth/forgot-password" | "/auth/reset-password" | "/auth/verify-otp";
}

const AuthLayout = ({ children, mode }: AuthLayoutProps) => {
  return (
    <div className="auth-layout-premium">
       <div className="auth-bg-shape shape-blob-1"></div>
      <div className="auth-bg-shape shape-blob-2"></div>
      
       <div className="auth-nav-container">
        <AuthNavbar mode={mode as any} />
      </div>

       <div className="auth-content-container">
        <div className="auth-form-wrapper">
          {children}
        </div>
      </div>

       <footer className="auth-footer">
        © {new Date().getFullYear()} QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default AuthLayout;
