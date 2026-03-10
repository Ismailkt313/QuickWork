import AuthNavbar from "../features/auth/components/AuthNavbar";
import OtpForm from "../features/auth/components/OtpForm";

const OtpPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-[Inter,system-ui,sans-serif]">
            <AuthNavbar mode="/auth/signup" />
            <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
                <OtpForm />
            </main>
        </div>
    );
};

export default OtpPage;
