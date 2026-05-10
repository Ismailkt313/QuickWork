import React from "react";
import { useNavigate } from "react-router-dom";
import {
  RiUser3Line,
  RiBriefcaseLine,
  RiMessage3Line,
  RiWallet3Line,
  RiSettings4Line,
  RiQuestionLine,
  RiLogoutBoxRLine,
  RiCloseLine,
  RiArrowRightSLine,
  RiServiceLine
} from "react-icons/ri";

interface MobileProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; initials: string } | null;
  onLogout: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
  showArrow?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  onClick,
  color = "#475569",
  showArrow = true,
}) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "16px 20px",
      cursor: "pointer",
      transition: "background 0.2s ease",
    }}
    className="mobile-nav-row"
  >
    <span style={{ fontSize: "20px", color, display: "flex" }}>{icon}</span>
    <span
      style={{
        fontSize: "15px",
        fontWeight: 600,
        color: "#1e293b",
        flex: 1,
      }}
    >
      {label}
    </span>
    {showArrow && <RiArrowRightSLine color="#cbd5e1" size={18} />}
  </div>
);

const MobileProfileDrawer: React.FC<MobileProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 3000,
          animation: "fadeIn 0.3s ease",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "#fff",
          borderTopLeftRadius: "24px",
          borderTopRightRadius: "24px",
          zIndex: 3001,
          paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
          animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.12)",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
          <div style={{ width: "36px", height: "5px", borderRadius: "10px", background: "#e2e8f0" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "0 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 800,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
            }}>
              {user?.initials || "U"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>{user?.name || "QuickWork User"}</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{user?.email || "Account overview"}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              width: "32px", 
              height: "32px", 
              borderRadius: "50%", 
              background: "#f8fafc", 
              border: "none", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#64748b"
            }}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ padding: "0 0 12px" }}>
            <NavItem 
              icon={<RiBriefcaseLine />} 
              label="My Jobs" 
              onClick={() => { navigate("/user/jobs"); onClose(); }} 
            />
            <NavItem 
              icon={<RiMessage3Line />} 
              label="Messages" 
              onClick={() => { navigate("/user/messages"); onClose(); }} 
            />
            <NavItem 
              icon={<RiWallet3Line />} 
              label="Wallet & History" 
              onClick={() => { navigate("/user/payment-history"); onClose(); }} 
            />
            <NavItem 
              icon={<RiServiceLine />} 
              label="Become a Provider" 
              onClick={() => { navigate("/provider/become-provider"); onClose(); }} 
              color="#3b82f6"
            />
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 0" }}>
            <NavItem 
              icon={<RiUser3Line />} 
              label="Profile Settings" 
              onClick={() => { navigate("/user/profile"); onClose(); }} 
            />
            <NavItem 
              icon={<RiSettings4Line />} 
              label="Preferences" 
              onClick={() => { navigate("/user/security"); onClose(); }} 
            />
            <NavItem 
              icon={<RiQuestionLine />} 
              label="Help Center" 
              onClick={() => { /* Help path */ onClose(); }} 
            />
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 0 0" }}>
            <NavItem 
              icon={<RiLogoutBoxRLine />} 
              label="Sign Out" 
              onClick={() => { onLogout(); onClose(); }} 
              color="#ef4444"
              showArrow={false}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .mobile-nav-row:active { background: #f8fafc; }
      `}</style>
    </>
  );
};

export default MobileProfileDrawer;
