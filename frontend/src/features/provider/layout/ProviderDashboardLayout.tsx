import React, { useState, useCallback, Suspense, useEffect } from "react";
import { RiMenuLine, RiMapLine, RiBellLine } from "react-icons/ri";
import { Link, Outlet, useLocation } from "react-router-dom";
import ProviderSidebar from "../components/ProviderSidebar";
import FallbackScreen from "../../../components/ui/FallbackScreen";
import { getMyProfile } from "../services/provider.service";
import "../components/ProviderSidebar.css";
import MobileBottomNav from "../../user/components/MobileBottomNav";

import ProviderMobileNav from "../components/ProviderMobileNav";

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
      <header className={`qw-mobile-header ${shouldHideHeader ? 'hide-header' : ''}`} aria-label="Mobile navigation bar" style={{ padding: '0 16px', height: '64px', borderBottom: '1px solid rgba(15, 23, 42, 0.05)' }}>
        <div className="qw-mobile-brand flex items-center gap-2.5">
          <div
            className="qw-logo-mark shadow-md"
            style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-hidden="true"
          >
            <RiMapLine size={15} color="#fff" />
          </div>
          <span className="font-extrabold tracking-tight text-lg text-slate-900">Quick<span className="text-blue-600">Work</span></span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100/80 text-slate-500 hover:bg-slate-100 transition-all active:scale-95 relative"
            aria-label="Notifications"
            type="button"
          >
            <RiBellLine size={20} />
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"
              aria-label="New notifications"
            />
          </button>
          
          {isMobile && (
            <Link to="/provider/profile" className="flex-shrink-0">
               {provider?.avatarUrl || provider?.profileImage ? (
                  <img
                    src={provider.avatarUrl || provider.profileImage}
                    alt={provider.name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm hover:border-blue-100 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm">
                    {provider?.initials || provider?.name?.charAt(0) || "P"}
                  </div>
                )}
            </Link>
          )}
        </div>
      </header>

      {isMobile && !shouldHideHeader && <ProviderMobileNav />}

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
          paddingTop: shouldHideHeader ? 0 : undefined,
          paddingBottom: isMobile ? (shouldHideHeader ? 0 : undefined) : 0
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
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </Suspense>
      </main>

      {!shouldHideHeader && <MobileBottomNav />}
    </div>
  );
};


export default ProviderDashboardLayout;
export type { ProviderDashboardLayoutProps };
