import AuthNavbar from "../features/auth/components/AuthNavbar";
import RegisterForm from "../features/auth/components/RegisterForm";

const RegisterPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
       <AuthNavbar />

       <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
        }}
      >
        <RegisterForm />
      </main>

       <footer
        style={{
          textAlign: "center",
          padding: "24px 16px",
          fontSize: "12px",
          color: "#9ca3af",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        © 2026 QuickWork Marketplace Inc. All rights reserved.
      </footer>
    </div>
  );
};

export default RegisterPage;
