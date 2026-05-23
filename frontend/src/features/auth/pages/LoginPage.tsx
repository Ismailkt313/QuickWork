import RegisterForm from "../components/RegisterForm";
import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import LoginRestrictionModal from "../components/LoginRestrictionModal";
import AuthLayout from "../components/AuthLayout";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [modalType, setModalType] = useState<
    "restricted" | "expired" | "blocked" | null
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");

    if (errorParam === "session_expired") return "expired";
    if (errorParam === "blocked") return "blocked";
    if (errorParam === "restricted") return "restricted";

    if (location.state?.fromRestricted) return "restricted";

    return null;
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.message) {
      toast.warning(location.state.message);
    }
  }, [location.state]);

  useEffect(() => {
    if (searchParams.has("error")) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <AuthLayout
        mode="/auth/login"
        visualTitle="Welcome Back to QuickWork"
        visualSubtitle="Access your premium dashboard, manage your projects, and connect with elite professionals."
      >
        <RegisterForm mode="/auth/login" />
      </AuthLayout>

      <LoginRestrictionModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType || "restricted"}
      />
    </>
  );
};

export default LoginPage;