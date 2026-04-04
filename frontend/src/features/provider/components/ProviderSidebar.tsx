// ProviderSidebar.tsx — QuickWork Provider Sidebar
// Requires: react-icons, bootstrap (CSS only)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiDashboardLine,
  RiBriefcaseLine,
  RiSearchLine,
  RiCheckboxCircleLine,
  RiMessage3Line,
  RiStarLine,
  RiWalletLine,
  RiFileListLine,
  RiSettings3Line,
  RiLogoutBoxLine,
   RiArrowRightSLine,
  RiMapLine,
  RiInboxArchiveLine,
} from 'react-icons/ri';
import { NavLink, Link } from 'react-router-dom';
import './ProviderSidebar.css';
import { api } from '../../../services/api';

// ─── Types ────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
  badgeVariant?: 'danger' | 'accent' | 'warning';
}

interface ProviderSidebarProps {
  /** Provider profile data */
  provider?: {
    name: string;
    role?: string;
    avatarUrl?: string;
    initials?: string;
    profileImage?: string;
    headline?: string;
  };
  /** Mobile: whether sidebar is visible */
  showOnMobile?: boolean;
  /** Mobile: callback to close the sidebar */
  onCloseMobile?: () => void;
  /** Logout handler */
  onLogout?: () => void;
}

// ─── Nav Config ──────────────────────────────────────────────
const PRIMARY_NAV: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <RiDashboardLine />,
    href: '/provider/dashboard',
  },
  {
    id: 'my-jobs',
    label: 'My Jobs',
    icon: <RiBriefcaseLine />,
    href: '/provider/my-jobs',
    badge: 3,
    badgeVariant: 'accent',
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: <RiInboxArchiveLine />,
    href: '/provider/requests',
    badge: 0,
    badgeVariant: 'warning',
  },
  {
    id: 'available-jobs',
    label: 'Available Jobs',
    icon: <RiSearchLine />,
    href: '/provider/available-jobs',
    badge: 'New',
    badgeVariant: 'warning',
  },
  {
    id: 'completed-jobs',
    label: 'Completed Jobs',
    icon: <RiCheckboxCircleLine />,
    href: '/provider/completed-jobs',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: <RiMessage3Line />,
    href: '/provider/messages',
    badge: 7,
    badgeVariant: 'danger',
  },
];

const SECONDARY_NAV: NavItem[] = [
  {
    id: 'reviews',
    label: 'Reviews',
    icon: <RiStarLine />,
    href: '/provider/reviews',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: <RiWalletLine />,
    href: '/provider/earnings',
  },
  {
    id: 'applications',
    label: 'My Applications',
    icon: <RiFileListLine />,
    href: '/provider/applications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <RiSettings3Line />,
    href: '/provider/settings',
  },
];

const SidebarNavItem: React.FC<{
  item: NavItem;
  onClick?: () => void;
}> = ({ item, onClick }) => (
  <NavLink
    to={item.href}
    className={({ isActive }) => `qw-nav-item${isActive ? ' active' : ''}`}
    onClick={onClick}
    aria-label={item.label}
    tabIndex={0}
  >
    <span className="qw-nav-icon" aria-hidden="true">
      {item.icon}
    </span>
    <span className="qw-nav-label-text">{item.label}</span>
    {item.badge !== undefined && (
      <span
        className={`qw-badge qw-badge-${item.badgeVariant ?? 'accent'}`}
        aria-label={`${item.badge} notifications`}
      >
        {item.badge}
      </span>
    )}
  </NavLink>
);


// ─── Main Sidebar Component ───────────────────────────────────
const ProviderSidebar: React.FC<ProviderSidebarProps> = ({
  provider,
  showOnMobile = false,
  onCloseMobile
}) => {
  console.log(provider,"provider");
  const [navItems, setNavItems] = React.useState<NavItem[]>(PRIMARY_NAV);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
         const offersRes = await api.get('/job/offers');
        const pendingCount = (offersRes.data.data || []).filter((r: any) => r.status === 'open').length;

         const assignmentsRes = await api.get('/assignment/my');
        const activeCount = (assignmentsRes.data.data || []).filter((as: any) => as.workStatus === 'assigned' || as.workStatus === 'in_progress').length;

        setNavItems(prev => prev.map(item => {
          if (item.id === 'requests') {
            return { ...item, badge: pendingCount > 0 ? pendingCount : undefined };
          }
          if (item.id === 'my-jobs') {
            return { ...item, badge: activeCount > 0 ? activeCount : undefined };
          }
          return item;
        }));
      } catch (error) {
        console.error('Failed to fetch nav counts:', error);
      }
    };
    fetchCounts();
  }, []);
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showOnMobile) onCloseMobile?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showOnMobile, onCloseMobile]);

  // Prevent body scroll on mobile when open
  useEffect(() => {
    if (showOnMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showOnMobile]);

  const handleNavClick = () => {
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {showOnMobile && (
        <div
          className="qw-backdrop visible"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`qw-sidebar${showOnMobile ? ' open' : ''}`}
        aria-label="Provider navigation"
        role="navigation"
      >
        {/* ── Brand ── */}
        <Link
          to="/provider/dashboard"
          className="qw-logo-area"
          onClick={handleNavClick}
          aria-label="QuickWork — go to dashboard"
        >
          <div className="qw-logo-mark" aria-hidden="true">
            <RiMapLine size={18} />
          </div>
          <div className="qw-brand-text">
            <span className="qw-brand-name">QuickWork</span>
            <span className="qw-brand-tag">Provider Hub</span>
          </div>
        </Link>

        {/* ── Scrollable Nav ── */}
        <nav className="qw-nav-scroll" aria-label="Main navigation">

          <p className="qw-nav-label">Overview</p>
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              onClick={handleNavClick}
            />
          ))}

          <div className="qw-divider" role="separator" />

          <p className="qw-nav-label">Manage</p>
          {SECONDARY_NAV.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              onClick={handleNavClick}
            />
          ))}
        </nav>

        {/* ── Fixed Bottom ── */}
        <div className="qw-sidebar-bottom">
          {/* Profile card */}
          {!provider ? (
            <div className="qw-profile-card loading">
              <div className="qw-avatar-wrap">
                <div className="qw-avatar skeleton" />
              </div>
              <div className="qw-profile-info">
                <div className="qw-profile-name skeleton-text" />
                <div className="qw-profile-role skeleton-text small" />
              </div>
            </div>
          ) : (
            <Link
              to="/provider/profile"
              className="qw-profile-card"
              onClick={handleNavClick}
              aria-label={`View profile of ${provider.name}`}
            >
              <div className="qw-avatar-wrap">
                {provider.avatarUrl || provider.profileImage ? (
                  <img
                    src={provider.avatarUrl || provider.profileImage}
                    alt={provider.name}
                    className="qw-avatar"
                    style={{ borderRadius: 10 }}
                  />
                ) : (
                  <div className="qw-avatar" aria-hidden="true">
                    {provider.initials || (provider.name ? provider.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '??')}
                  </div>
                )}
                <span className="qw-avatar-status" aria-label="Online" />
              </div>
              <div className="qw-profile-info">
                <div className="qw-profile-name text-truncate" style={{ maxWidth: '120px' }}>{provider.name || 'Provider'}</div>
                {(provider.role || provider.headline) && (
                  <div className="qw-profile-role text-truncate" style={{ maxWidth: '120px' }}>{provider.role || provider.headline || 'Top Rated'}</div>
                )}
              </div>
              <span className="qw-profile-chevron" aria-hidden="true">
                <RiArrowRightSLine />
              </span>
            </Link>
          )}


          {/* Logout */}
          <button
            className="qw-logout-btn"
            onClick={()=>navigate('/')}
            type="button"
            aria-label="Switch to client"
          >
            <RiLogoutBoxLine aria-hidden="true" />
            Switch to client
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProviderSidebar;
export type { ProviderSidebarProps };