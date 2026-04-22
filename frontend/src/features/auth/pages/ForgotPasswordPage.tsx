import AuthNavbar from "../components/AuthNavbar";
import ForgotPasswordForm from "../components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="auth-page">
      <AuthNavbar mode="/auth/login" />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <ForgotPasswordForm />
      </main>
      <footer
        className="text-center py-4 text-secondary"
        style={{ fontSize: "0.75rem" }}
      >
        © QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
