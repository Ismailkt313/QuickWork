import RegisterForm from "../components/RegisterForm";
import AuthLayout from "../components/AuthLayout";

const RegisterPage = () => {
  return (
    <AuthLayout
      mode="/auth/signup"
      visualTitle="Start Your Journey with QuickWork"
      visualSubtitle="Create an account today to hire expert freelancers or find premium jobs in your area."
    >
      <RegisterForm mode="/auth/signup" />
    </AuthLayout>
  );
};

export default RegisterPage;
