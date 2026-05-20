import OtpForm from "../components/OtpForm";
import AuthLayout from "../components/AuthLayout";

const OtpPage = () => {
  return (
    <AuthLayout
      mode="/auth/verify-otp"
      visualTitle="Verify Your Email"
      visualSubtitle="We want to ensure your account's security before you join our community."
    >
      <OtpForm />
    </AuthLayout>
  );
};

export default OtpPage;
