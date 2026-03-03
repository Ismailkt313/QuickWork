import AuthNavbar from "../features/auth/components/AuthNavbar";
import RegisterForm from "../features/auth/components/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="auth-page">
      <AuthNavbar mode="/signup" />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <RegisterForm mode="/signup" />
      </main>
      <footer className="text-center py-4 text-secondary" style={{ fontSize: '0.75rem' }}>
        © 2026 QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default RegisterPage;
