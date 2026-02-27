import { Link } from "react-router-dom";
import type { RegisterFormProps } from "../types";
import "../auth.css";

const AuthNavbar = ({ mode }: RegisterFormProps) => {
    const isSignup = mode === "/signup";
    return (
        <nav className="auth-navbar">
            <div className="auth-navbar-inner">
                <Link to="/" className="auth-navbar-logo">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="#2563eb"
                        />
                    </svg>
                    <span className="auth-navbar-logo-text">QuickWork</span>
                </Link>

                <div className="auth-navbar-right">
                    <span className="auth-navbar-hint">
                        {isSignup ? "Already have an account?" : "Don\u2019t have an account?"}
                    </span>
                    <Link
                        to={isSignup ? "/login" : "/signup"}
                        className="auth-navbar-btn"
                    >
                        {isSignup ? "Log in" : "Sign up"}
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default AuthNavbar;
