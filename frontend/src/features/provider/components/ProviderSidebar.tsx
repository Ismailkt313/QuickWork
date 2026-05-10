import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiBriefcaseLine,
  RiSearchLine,
  RiMessage3Line,
  RiStarLine,
  RiWalletLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiArrowRightSLine,
  RiMapLine,
  RiInboxArchiveLine,
  RiTimeLine,
} from "react-icons/ri";
import { NavLink, Link } from "react-router-dom";
import "./ProviderSidebar.css";
import { api } from "../../../services/api";
import { ENDPOINTS } from "../../../constants/endpoints";
import { JOB_STATUS } from "../../../constants/jobStatus";
import { WORK_STATUS } from "../../../constants/assignment";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number | string;
  badgeVariant?: "danger" | "accent" | "warning";
}

interface ProviderSidebarProps {
  provider?: {
    name: string;
    role?: string;
    avatarUrl?: string;
    initials?: string;
    profileImage?: string;
    headline?: string;
  };

  showOnMobile?: boolean;

  onCloseMobile?: () => void;

  onLogout?: () => void;
}

const PRIMARY_NAV: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <RiDashboardLine />,
    href: "/provider/dashboard",
  },
  {
    id: "my-jobs",
    label: "Assignments",
    icon: <RiBriefcaseLine />,
    href: "/provider/my-jobs",
  },
  {
    id: "messages",
    label: "Messages",
    icon: <RiMessage3Line />,
    href: "/provider/messages",
  },
  {
    id: "available-jobs",
    label: "Available Jobs",
    icon: <RiSearchLine />,
    href: "/provider/available-jobs",
  },
  {
    id: "requests",
    label: "Direct Hires",
    icon: <RiInboxArchiveLine />,
    href: "/provider/requests",
  },
  {
    id: "earnings",
    label: "Wallet",
    icon: <RiWalletLine />,
    href: "/provider/wallet",
  },
];

const SECONDARY_NAV: NavItem[] = [
  {
    id: "reviews",
    label: "Reviews",
    icon: <RiStarLine />,
    href: "/provider/reviews",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <RiSettings3Line />,
    href: "/provider/profile",
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
    aria-label={item.label}
    tabIndex={0}
  >
    <span className="qw-nav-icon" aria-hidden="true">
      {item.icon}
    </span>
    <span className="qw-nav-label-text">{item.label}</span>
    {item.badge !== undefined && (
      <span
        className={`qw-badge qw-badge-${item.badgeVariant ?? "accent"}`}
        aria-label={`${item.badge} notifications`}
      >
        {item.badge}
      </span>
    )}
  </NavLink>
);

const ProviderSidebar: React.FC<ProviderSidebarProps> = ({
  provider,
  showOnMobile = false,
  onCloseMobile,
  onLogout,
}) => {

  const [navItems, setNavItems] = React.useState<NavItem[]>(PRIMARY_NAV);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const offersRes = await api.get(ENDPOINTS.JOB.OFFERS);
        const pendingCount = (offersRes.data.data || []).filter(
          (r: { status: string }) => r.status === JOB_STATUS.OPEN,
        ).length;

        const assignmentsRes = await api.get(ENDPOINTS.ASSIGNMENT.MY);
        const activeCount = (assignmentsRes.data.data || []).filter(
          (as: { workStatus: string }) =>
            as.workStatus === WORK_STATUS.ASSIGNED ||
            as.workStatus === WORK_STATUS.IN_PROGRESS,
        ).length;

        setNavItems((prev) =>
          prev.map((item) => {
            if (item.id === "requests") {
              return {
                ...item,
                badge: pendingCount > 0 ? pendingCount : undefined,
              };
            }
            if (item.id === "my-jobs") {
              return {
                ...item,
                badge: activeCount > 0 ? activeCount : undefined,
              };
            }
            return item;
          }),
        );
      } catch (error) {
        console.error("Failed to fetch nav counts:", error);
      }
    };
    fetchCounts();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showOnMobile) onCloseMobile?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showOnMobile, onCloseMobile]);

  useEffect(() => {
    if (showOnMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showOnMobile]);

  const handleNavClick = () => {
    onCloseMobile?.();
  };

  return (
    <>
      { }
      {showOnMobile && (
        <div
          className="qw-backdrop visible"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`qw-sidebar${showOnMobile ? " open" : ""}`}
        aria-label="Provider navigation"
        role="navigation"
      >
        { }
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

        { }
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

        { }
        <div className="qw-sidebar-bottom">
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
                  />
                ) : (
                  <div className="qw-avatar">
                    {provider.initials || provider.name?.charAt(0) || "P"}
                  </div>
                )}
                <span className="qw-avatar-status" />
              </div>
              <div className="qw-profile-info">
                <div className="qw-profile-name">{provider.name || "Provider"}</div>
                <div className="qw-profile-role">{provider.role || provider.headline || "Active Member"}</div>
              </div>
              <RiArrowRightSLine className="qw-profile-chevron" />
            </Link>
          )}

          <div className="qw-bottom-actions">
            <button
              className="qw-action-btn qw-action-switch"
              onClick={() => navigate("/")}
              title="Switch to Client View"
            >
              <RiMapLine size={16} />
              <span className="qw-action-label">Switch to Client</span>
              <RiArrowRightSLine size={16} className="qw-action-arrow" />
            </button>

            <button
              className="qw-action-btn qw-action-logout"
              onClick={onLogout}
              title="Sign Out"
            >
              <RiLogoutBoxLine size={16} />
              <span className="qw-action-label">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProviderSidebar;
export type { ProviderSidebarProps };
