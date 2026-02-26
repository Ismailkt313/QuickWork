import { Link } from "react-router-dom";

const AuthNavbar = () => {
    return (
        <nav
            style={{
                width: "100%",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 24px",
                }}
            >
                 <Link
                    to="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        textDecoration: "none",
                    }}
                >
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
                    <span
                        style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#111827",
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        QuickWork
                    </span>
                </Link>

                 <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span
                        style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        Already have an account?
                    </span>
                    <Link
                        to="/login"
                        style={{
                            padding: "8px 20px",
                            borderRadius: "8px",
                            border: "1.5px solid #2563eb",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#2563eb",
                            textDecoration: "none",
                            fontFamily: "'Inter', sans-serif",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#2563eb";
                            e.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#2563eb";
                        }}
                    >
                        Log in
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default AuthNavbar;
