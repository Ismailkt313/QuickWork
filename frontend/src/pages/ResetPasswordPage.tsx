import AuthNavbar from "../features/auth/components/AuthNavbar";
import ResetPasswordForm from "../features/auth/components/ResetPasswordForm";

const ResetPasswordPage = () => {
    return (
        <div className="auth-page">
            <AuthNavbar mode="/login" />
            <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
                <ResetPasswordForm />
            </main>
            <footer className="text-center py-4 text-secondary" style={{ fontSize: '0.75rem' }}>
                © QuickWork Marketplace Inc. All rights reserved.
            </footer>
        </div>
    );
};

export default ResetPasswordPage;
