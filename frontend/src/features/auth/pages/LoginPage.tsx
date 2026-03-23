import AuthNavbar from "../components/AuthNavbar";
import RegisterForm from "../components/RegisterForm";
import { useEffect } from "react";
import { useLocation} from "react-router-dom";
import { toast } from "react-toastify"

const LoginPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      toast.warning(location.state.message);
    }
  }, [location.state]);


  return (
    <div className="auth-page">
      <AuthNavbar mode="/auth/login" />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <RegisterForm mode="/auth/login" />
      </main>
      <footer className="text-center py-4 text-secondary" style={{ fontSize: '0.75rem' }}>
        © QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;