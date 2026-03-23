import React, { useState, useCallback, Suspense } from 'react';
import { RiMenuLine, RiMapLine, RiBellLine } from 'react-icons/ri';
import { Outlet } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar';
import FallbackScreen from '../../../components/ui/FallbackScreen';
import '../components/ProviderSidebar.css';  
 interface ProviderDashboardLayoutProps {
   activePath?: string;
   provider?: {
    name: string;
    role?: string;
    avatarUrl?: string;
    initials?: string;
  };
   onLogout?: () => void;
   onNavigate?: (href: string) => void;
}

 const ProviderDashboardLayout: React.FC<ProviderDashboardLayoutProps> = ({
  provider,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile  = useCallback(() => setMobileOpen(true),  []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="qw-layout">

       <header className="qw-mobile-header" aria-label="Mobile navigation bar">
        <button
          className="qw-hamburger"
          onClick={openMobile}
          aria-label="Open sidebar navigation"
          aria-expanded={mobileOpen}
          type="button"
        >
          <RiMenuLine />
        </button>

        {/* Brand */}
        <div className="qw-mobile-brand d-flex align-items-center gap-2">
          <div
            className="qw-logo-mark"
            style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }}
            aria-hidden="true"
          >
            <RiMapLine size={14} color="#fff" />
          </div>
          Quick<span>Work</span>
        </div>

        {/* Right: bell */}
        <div className="ms-auto position-relative" style={{ lineHeight: 0 }}>
          <button
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 9,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#e8eaf0',
              fontSize: 18,
              position: 'relative',
            }}
            aria-label="Notifications"
            type="button"
          >
            <RiBellLine />
             <span
              aria-label="You have new notifications"
              style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ff6b6b',
                border: '2px solid #0d0f14',
              }}
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
      >
        <Suspense fallback={<FallbackScreen />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default ProviderDashboardLayout;
export type { ProviderDashboardLayoutProps };