import ResetPasswordForm from "../components/ResetPasswordForm";
import AuthLayout from "../components/AuthLayout";

const ResetPasswordPage = () => {
  return (
    <AuthLayout
      mode="/auth/reset-password"
      visualTitle="Secure Your Account"
      visualSubtitle="Create a new, strong password to regain access to your QuickWork dashboard."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
