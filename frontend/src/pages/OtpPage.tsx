import AuthNavbar from "../features/auth/components/AuthNavbar";
import OtpForm from "../features/auth/components/OtpForm";
import "../features/auth/auth.css";

const OtpPage = () => {
    return (
        <div className="auth-page">
            <AuthNavbar mode="/signup" />
            <main className="auth-main">
                <OtpForm />
            </main>
            <footer className="auth-footer">
                © QuickWork Marketplace Inc. All rights reserved.
            </footer>
        </div>
    );
};

export default OtpPage;
