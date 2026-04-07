import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { RiMenuLine, RiMapLine, RiBellLine } from 'react-icons/ri';
import { Outlet } from 'react-router-dom';
import ProviderSidebar from '../components/ProviderSidebar';
import FallbackScreen from '../../../components/ui/FallbackScreen';
import { getMyProfile } from '../services/provider.service';
import '../components/ProviderSidebar.css';  
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
  const [provider, setProvider] = useState<ProviderDashboardLayoutProps['provider']>(initialProvider);

  useEffect(() => {
    if (!initialProvider) {
      const fetchProfile = async () => {
        try {
          const response = await getMyProfile();
          if (response.success) {
            setProvider(response.data);
          } else {
            setProvider({ name: 'Provider', initials: 'P' });
          }
        } catch (error) {
          console.error("Failed to fetch provider profile:", error);
          setProvider({ name: 'Provider', initials: 'P' });
        } finally {
          // fetchProfile completed
        }
      };
      fetchProfile();
    }
  }, [initialProvider]);

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
        {provider?.verificationStatus === 'pending' && (
          <div 
            className="alert alert-warning border-0 mb-4 mx-3 mx-lg-5 mt-4 d-flex align-items-center gap-3 shadow-sm rounded-4"
            style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b !important' }}
            role="alert"
          >
            <div className="bg-white p-2 rounded-3 shadow-sm text-warning">
              <RiBellLine size={20} />
            </div>
            <div>
              <h4 className="fw-bold mb-0 small" style={{ color: '#92400e' }}>Profile under verification</h4>
              <p className="mb-0 text-amber-800 small" style={{ opacity: 0.8 }}>
                Your application is being reviewed by our admin team. You can explore the dashboard, but job interactions are restricted until approval.
              </p>
            </div>
          </div>
        )}
        <Suspense fallback={<FallbackScreen />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default ProviderDashboardLayout;
export type { ProviderDashboardLayoutProps };