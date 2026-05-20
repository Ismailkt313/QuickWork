import ForgotPasswordForm from "../components/ForgotPasswordForm";
import AuthLayout from "../components/AuthLayout";

const ForgotPasswordPage = () => {
  return (
    <AuthLayout
      mode="/auth/forgot-password"
      visualTitle="Forgot Password?"
      visualSubtitle="Don't worry, we'll help you get back into your premium account securely."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
