import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  RiHome5Line,
  RiHome5Fill,
  RiSearch2Line,
  RiSearch2Fill,
  RiBriefcaseLine,
  RiBriefcaseFill,
  RiMessage3Line,
  RiMessage3Fill,
  RiWallet3Line,
  RiWallet3Fill,
  RiDashboardLine,
  RiDashboardFill,
  RiFileList3Line,
  RiFileList3Fill,
} from "react-icons/ri";

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;

  const isProvider = location.pathname.startsWith("/provider");

  const USER_NAV_ITEMS = [
    {
      label: "Home",
      path: "/",
      icon: <RiHome5Line />,
      activeIcon: <RiHome5Fill />,
    },
    {
      label: "Browse",
      path: "/user/services",
      icon: <RiSearch2Line />,
      activeIcon: <RiSearch2Fill />,
    },
    {
      label: "My Jobs",
      path: "/user/jobs",
      icon: <RiBriefcaseLine />,
      activeIcon: <RiBriefcaseFill />,
    },
    {
      label: "Messages",
      path: "/user/messages",
      icon: <RiMessage3Line />,
      activeIcon: <RiMessage3Fill />,
    },
    {
      label: "Wallet",
      path: "/user/payment-history",
      icon: <RiWallet3Line />,
      activeIcon: <RiWallet3Fill />,
    },
  ];

  const PROVIDER_NAV_ITEMS = [
    {
      label: "Dashboard",
      path: "/provider/dashboard",
      icon: <RiDashboardLine />,
      activeIcon: <RiDashboardFill />,
    },
    {
      label: "Find Jobs",
      path: "/provider/available-jobs",
      icon: <RiSearch2Line />,
      activeIcon: <RiSearch2Fill />,
    },
    {
      label: "My Tasks",
      path: "/provider/assignments",
      icon: <RiFileList3Line />,
      activeIcon: <RiFileList3Fill />,
    },
    {
      label: "Messages",
      path: "/provider/messages",
      icon: <RiMessage3Line />,
      activeIcon: <RiMessage3Fill />,
    },
    {
      label: "Earnings",
      path: "/provider/earnings",
      icon: <RiWallet3Line />,
      activeIcon: <RiWallet3Fill />,
    },
  ];

  const NAV_ITEMS = isProvider ? PROVIDER_NAV_ITEMS : USER_NAV_ITEMS;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(15, 23, 42, 0.05)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0 8px env(safe-area-inset-bottom, 12px)",
        boxShadow: "0 -8px 24px rgba(15, 23, 42, 0.05)",
        zIndex: 2000,
        height: "calc(68px + env(safe-area-inset-bottom, 12px))",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.label}
            to={item.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              textDecoration: "none",
              color: isActive ? "#2563eb" : "#64748b",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              flex: 1,
              height: "100%",
              position: "relative",
            }}
          >
            {isActive && (
              <div 
                style={{
                  position: "absolute",
                  top: 0,
                  width: "28px",
                  height: "3px",
                  background: "#2563eb",
                  borderRadius: "0 0 100px 100px",
                  boxShadow: "0 2px 10px rgba(37, 99, 235, 0.4)",
                }}
              />
            )}

            <div
              style={{
                fontSize: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "34px",
                borderRadius: "12px",
                background: isActive ? "rgba(37, 99, 235, 0.06)" : "transparent",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {isActive ? item.activeIcon : item.icon}
            </div>
            
            <span
              style={{
                fontSize: "9px",
                fontWeight: isActive ? 800 : 600,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                opacity: isActive ? 1 : 0.7,
              }}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
