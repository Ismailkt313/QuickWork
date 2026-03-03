import { Link } from "react-router-dom";
import type { RegisterFormProps } from "../types";

const AuthNavbar = ({ mode }: RegisterFormProps) => {
    const isSignup = mode === "/signup";
    return (
        <nav className="auth-navbar sticky-top py-3">
            <div className="container d-flex align-items-center justify-content-between" style={{ maxWidth: 1100 }}>
                <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
                    <div className="d-flex align-items-center justify-content-center rounded-3"
                        style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                        <span className="text-white fw-bold" style={{ fontSize: 15 }}>Q</span>
                    </div>
                    <span className="brand-text">QuickWork</span>
                </Link>

                <div className="d-flex align-items-center gap-3">
                    <span className="text-secondary d-none d-sm-inline" style={{ fontSize: '0.875rem' }}>
                        {isSignup ? "Already have an account?" : "Don\u2019t have an account?"}
                    </span>
                    <Link
                        to={isSignup ? "/login" : "/signup"}
                        className="btn btn-outline-primary fw-semibold px-4"
                        style={{ fontSize: '0.875rem', borderRadius: 10, borderWidth: '1.5px' }}
                    >
                        {isSignup ? "Log in" : "Sign up"}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default AuthNavbar;
