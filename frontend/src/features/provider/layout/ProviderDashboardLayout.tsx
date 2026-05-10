import React, { useState, useCallback, Suspense, useEffect } from "react";
import { RiMenuLine, RiMapLine, RiBellLine } from "react-icons/ri";
import { Outlet, useLocation } from "react-router-dom";
import ProviderSidebar from "../components/ProviderSidebar";
import FallbackScreen from "../../../components/ui/FallbackScreen";
import { getMyProfile } from "../services/provider.service";
import "../components/ProviderSidebar.css";
import MobileBottomNav from "../../user/components/MobileBottomNav";

interface ProviderDashboardLayoutProps {
  activePath?: string;
  provider?: {
    name: string;
    role?: string;
    avatarUrl?: string;
    initials?: string;
    profileImage?: string;
    headline?: string;
    verificationStatus?: string;
  };
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
}

const ProviderDashboardLayout: React.FC<ProviderDashboardLayoutProps> = ({
  provider: initialProvider,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [provider, setProvider] =
    useState<ProviderDashboardLayoutProps["provider"]>(initialProvider);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!initialProvider) {
      const fetchProfile = async () => {
        try {
          const response = await getMyProfile<{ name: string; email: string; profileImage?: string }>();
          if (response.success) {
            setProvider(response.data);
          } else {
            setProvider({ name: "Provider", initials: "P" });
          }
        } catch (error) {
          console.error("Failed to fetch provider profile:", error);
          setProvider({ name: "Provider", initials: "P" });
        }
      };
      fetchProfile();
    }
  }, [initialProvider]);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const location = useLocation();
  const isMessaging = location.pathname.includes("/messages");
  const hasActiveChat = new URLSearchParams(location.search).get("userId") || 
                       new URLSearchParams(location.search).get("conversationId") ||
                       new URLSearchParams(location.search).get("id");
  const shouldHideHeader = isMobile && isMessaging && hasActiveChat;

  return (
    <div className={`qw-layout ${shouldHideHeader ? 'hide-global-header' : ''}`}>
      <header className={`qw-mobile-header ${shouldHideHeader ? 'hide-header' : ''}`} aria-label="Mobile navigation bar">
        <button
          className="qw-hamburger"
          onClick={openMobile}
          aria-label="Open sidebar navigation"
          aria-expanded={mobileOpen}
          type="button"
        >
          <RiMenuLine />
        </button>
        <div className="qw-mobile-brand flex items-center gap-2">
          <div
            className="qw-logo-mark"
            style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }}
            aria-hidden="true"
          >
            <RiMapLine size={14} color="#fff" />
          </div>
          Quick<span className="text-blue-600">Work</span>
        </div>
        <div className="ml-auto relative flex items-center" style={{ lineHeight: 0 }}>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
            type="button"
          >
            <RiBellLine size={18} />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"
              aria-label="You have new notifications"
            />
          </button>
        </div>
      </header>

      <ProviderSidebar
        provider={provider}
        showOnMobile={mobileOpen}
        onCloseMobile={closeMobile}
        onLogout={onLogout}
      />

      <main
        className="qw-main-content"
        id="main-content"
        aria-label="Main content"
        tabIndex={-1}
        style={{
          paddingTop: shouldHideHeader ? 0 : "64px",
          paddingBottom: isMobile ? (shouldHideHeader ? 0 : "calc(64px + env(safe-area-inset-bottom, 12px))") : 0
        }}
      >
        {provider?.verificationStatus === "pending" && (
          <div
            className="mx-4 lg:mx-8 mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 shadow-sm"
            role="alert"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm flex-shrink-0">
              <RiBellLine size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900 mb-0.5 uppercase tracking-wide">
                Account Verification Pending
              </h4>
              <p className="text-xs text-amber-800 font-medium opacity-90 leading-relaxed">
                Your application is currently being reviewed. You can explore your dashboard, but some job interactions will be restricted until your profile is approved.
              </p>
            </div>
          </div>
        )}
        <Suspense fallback={<FallbackScreen />}>
          <Outlet />
        </Suspense>
      </main>
      {!shouldHideHeader && <MobileBottomNav />}
    </div>
  );
};

export default ProviderDashboardLayout;
export type { ProviderDashboardLayoutProps };
