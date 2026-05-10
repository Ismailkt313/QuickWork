import React, { useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  RiDashboardLine,
  RiBriefcaseLine,
  RiMessage3Line,
  RiSearchLine,
  RiInboxArchiveLine,
  RiWalletLine,
  RiStarLine,
  RiSettings3Line,
} from "react-icons/ri";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/provider/dashboard", icon: <RiDashboardLine /> },
  { label: "Assignments", href: "/provider/my-jobs", icon: <RiBriefcaseLine /> },
  { label: "Messages", href: "/provider/messages", icon: <RiMessage3Line /> },
  { label: "Find Jobs", href: "/provider/available-jobs", icon: <RiSearchLine /> },
  { label: "Direct Hires", href: "/provider/requests", icon: <RiInboxArchiveLine /> },
  { label: "Wallet", href: "/provider/wallet", icon: <RiWalletLine /> },
  { label: "Reviews", href: "/provider/reviews", icon: <RiStarLine /> },
  { label: "Settings", href: "/provider/profile", icon: <RiSettings3Line /> },
];

const ProviderMobileNav: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = scrollRef.current.querySelector(".active");
      if (activeItem) {
        const scrollContainer = scrollRef.current;
        const itemRect = activeItem.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        
        const scrollLeft = activeItem.parentElement!.scrollLeft + itemRect.left - containerRect.left - (containerRect.width / 2) + (itemRect.width / 2);
        
        scrollContainer.scrollTo({
          left: scrollLeft,
          behavior: "smooth"
        });
      }
    }
  }, [location.pathname]);

  return (
    <nav className="sticky top-[64px] z-[999] w-full bg-white/90 backdrop-blur-md border-b border-slate-200/50 lg:hidden overflow-hidden">
      <div
        ref={scrollRef}
        className="flex items-center gap-2.5 overflow-x-auto px-4 py-3.5 no-scrollbar scroll-smooth snap-x"
        style={{
          msOverflowStyle: "none",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4.5 py-2.5 rounded-xl whitespace-nowrap transition-all duration-300 select-none snap-center border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md active scale-[0.98]"
                  : "bg-slate-50 text-slate-500 border-slate-100/50 hover:text-slate-900 active:bg-slate-100"
              }`
            }
            style={{ paddingLeft: '14px', paddingRight: '14px' }}
          >
            <span className={`text-[17px] ${location.pathname === item.href ? 'opacity-100' : 'opacity-80'}`}>
              {item.icon}
            </span>
            <span className="text-[12px] font-bold tracking-wide">
              {item.label}
            </span>
          </NavLink>
        ))}
        {/* Spacer for better scrolling end */}
        <div className="flex-shrink-0 w-6 h-4" />
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
};

export default ProviderMobileNav;

