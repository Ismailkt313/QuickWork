import React from "react";
import {
  RiBriefcaseLine,
  RiUser3Line,
  RiShieldFlashLine,
  RiLogoutBoxLine,
  RiArrowRightSLine,
  RiMapPin2Line,
  RiSearchEyeLine,
} from "react-icons/ri";
import { NavLink, Link } from "react-router-dom";
import "../../provider/components/ProviderSidebar.css";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
  badgeVariant?: "danger" | "accent" | "warning";
}

interface UserSidebarProps {
  user?: {
    name: string;
    email?: string;
    avatarUrl?: string;
    initials?: string;
  };
  showOnMobile?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

const PRIMARY_NAV: NavItem[] = [
  {
    id: "marketplace",
    label: "Marketplace",
    icon: <RiSearchEyeLine />,
    href: "/user/services",
  },
  {
    id: "my-jobs",
    label: "My Jobs",
    icon: <RiBriefcaseLine />,
    href: "/user/jobs",
  },
];

const SECONDARY_NAV: NavItem[] = [
  {
    id: "messages",
    label: "Messages",
    icon: <RiUser3Line />,
    href: "/user/messages",
  },
  {
    id: "security",
    label: "Security",
    icon: <RiShieldFlashLine />,
    href: "/user/security",
  },
];

const SidebarNavItem: React.FC<{
  item: NavItem;
  onClick?: () => void;
}> = ({ item, onClick }) => (
  <NavLink
    to={item.href}
    className={({ isActive }) => `qw-nav-item${isActive ? " active" : ""}`}
    onClick={onClick}
  >
    <span className="qw-nav-icon">{item.icon}</span>
    <span className="qw-nav-label-text">{item.label}</span>
    {item.badge !== undefined && (
      <span className={`qw-badge qw-badge-${item.badgeVariant ?? "accent"}`}>
        {item.badge}
      </span>
    )}
  </NavLink>
);

const UserSidebar: React.FC<UserSidebarProps> = ({
  user = {
    name: "User",
    initials: "U",
  },
  showOnMobile = false,
  onCloseMobile,
  onLogout,
}) => {
  const handleNavClick = () => {
    onCloseMobile?.();
  };

  return (
    <>
      {showOnMobile && (
        <div className="qw-backdrop visible" onClick={onCloseMobile} />
      )}

      <aside className={`qw-sidebar${showOnMobile ? " open" : ""}`}>
        <Link
          to="/"
          className="qw-logo-area"
          onClick={handleNavClick}
        >
          <div className="qw-logo-mark">
            <RiMapPin2Line size={18} />
          </div>
          <div className="qw-brand-text">
            <span className="qw-brand-name">QuickWork</span>
            <span className="qw-brand-tag">User Dashboard</span>
          </div>
        </Link>

        <nav className="qw-nav-scroll">
          <p className="qw-nav-label">Main Navigation</p>
          {PRIMARY_NAV.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              onClick={handleNavClick}
            />
          ))}

          <div className="qw-divider" />

          <p className="qw-nav-label">Account Settings</p>
          {SECONDARY_NAV.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              onClick={handleNavClick}
            />
          ))}
        </nav>

        <div className="qw-sidebar-bottom">
          <Link
            to="/user/profile"
            className="qw-profile-card"
            onClick={handleNavClick}
          >
            <div className="qw-avatar-wrap">
              <div className="qw-avatar">
                {user.initials ?? user.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="qw-avatar-status" />
            </div>
            <div className="qw-profile-info">
              <div className="qw-profile-name">{user.name}</div>
              <div className="qw-profile-role">User Account</div>
            </div>
            <span className="qw-profile-chevron">
              <RiArrowRightSLine />
            </span>
          </Link>

          <button className="qw-logout-btn" onClick={onLogout} type="button">
            <RiLogoutBoxLine />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
