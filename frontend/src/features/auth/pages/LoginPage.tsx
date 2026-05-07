import AuthNavbar from "../components/AuthNavbar";
import RegisterForm from "../components/RegisterForm";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoginRestrictionModal from "../components/LoginRestrictionModal";

const LoginPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalType, setModalType] = useState<
    "restricted" | "expired" | "blocked" | null
  >(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam === "session_expired") return "expired";
    if (errorParam === "blocked") return "blocked";

    if (location.state?.fromRestricted) return "restricted";
    return null;
  });

  useEffect(() => {
    if (location.state?.message) {
      toast.warning(location.state.message);
    }
  }, [location.state?.message]);

  useEffect(() => {
    if (searchParams.has("error")) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="auth-page">
      <AuthNavbar mode="/auth/login" />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <RegisterForm mode="/auth/login" />
      </main>

      <LoginRestrictionModal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        type={modalType || "restricted"}
      />

      <footer
        className="text-center py-4 text-secondary"
        style={{ fontSize: "0.75rem" }}
      >
        © QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;
