// ProviderSidebar.tsx — QuickWork Provider Sidebar
// Requires: react-icons, bootstrap (CSS only)

import React, { useEffect } from 'react';
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
} from 'react-icons/ri';
import { NavLink, Link } from 'react-router-dom';
import './ProviderSidebar.css';

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

// ─── NavItem Component ────────────────────────────────────────
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
  provider = {
    name: 'Alex Johnson',
    role: 'Top Rated Provider',
    initials: 'AJ',
  },
  showOnMobile = false,
  onCloseMobile,
  onLogout,
}) => {
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
          {PRIMARY_NAV.map((item) => (
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
          <Link
            to="/provider/profile"
            className="qw-profile-card"
            onClick={handleNavClick}
            aria-label={`View profile of ${provider.name}`}
          >
            <div className="qw-avatar-wrap">
              {provider.avatarUrl ? (
                <img
                  src={provider.avatarUrl}
                  alt={provider.name}
                  className="qw-avatar"
                  style={{ borderRadius: 10 }}
                />
              ) : (
                <div className="qw-avatar" aria-hidden="true">
                  {provider.initials ?? provider.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="qw-avatar-status" aria-label="Online" />
            </div>
            <div className="qw-profile-info">
              <div className="qw-profile-name">{provider.name}</div>
              {provider.role && (
                <div className="qw-profile-role">{provider.role}</div>
              )}
            </div>
            <span className="qw-profile-chevron" aria-hidden="true">
              <RiArrowRightSLine />
            </span>
          </Link>

          {/* Logout */}
          <button
            className="qw-logout-btn"
            onClick={onLogout}
            type="button"
            aria-label="Log out"
          >
            <RiLogoutBoxLine aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProviderSidebar;
export type { ProviderSidebarProps };