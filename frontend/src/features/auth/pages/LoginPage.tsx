import AuthNavbar from "../components/AuthNavbar";
import RegisterForm from "../components/RegisterForm";
import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify"
import LoginRestrictionModal from "../components/LoginRestrictionModal";

const LoginPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modalType, setModalType] = useState<'restricted' | 'expired' | 'blocked' | null>(null);

  useEffect(() => {
    // 1. Check for legacy toast messages
    if (location.state?.message) {
      toast.warning(location.state.message);
    }

    // 2. Check for new modal triggers
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_expired') {
      setModalType('expired');
      setSearchParams({}, { replace: true });
    } else if (errorParam === 'blocked') {
      setModalType('blocked');
      setSearchParams({}, { replace: true });
    } else if (location.state?.fromRestricted) {
      setModalType('restricted');
    }
  }, [location.state, searchParams, setSearchParams]);


  return (
    <div className="auth-page">
      <AuthNavbar mode="/auth/login" />
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <RegisterForm mode="/auth/login" />
      </main>

      <LoginRestrictionModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        type={modalType || 'restricted'} 
      />

      <footer className="text-center py-4 text-secondary" style={{ fontSize: '0.75rem' }}>
        © QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;