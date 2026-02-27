import AuthNavbar from "../features/auth/components/AuthNavbar";
import RegisterForm from "../features/auth/components/RegisterForm";
import "../features/auth/auth.css";

const LoginPage = () => {
  return (
    <div className="auth-page">
      <AuthNavbar mode="/login" />
      <main className="auth-main">
        <RegisterForm mode="/login" />
      </main>
      <footer className="auth-footer">
        © QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
