import React, { useState, useEffect } from 'react';
import UserSidebar from '../components/UserSidebar';
import { RiMenuLine, RiMapPin2Line } from 'react-icons/ri';
import { useNavigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../../provider/components/ProviderSidebar.css';

const UserDashboardLayout: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          name: decoded.name || 'User',
          email: decoded.email || '',
        });
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  return (
    <div className="qw-layout">
      {/* Mobile Top Header */}
      <header className="qw-mobile-header">
        <button
          className="qw-hamburger"
          onClick={() => setShowMobileSidebar(true)}
          aria-label="Open navigation"
        >
          <RiMenuLine />
        </button>
        <div className="qw-mobile-brand">
          <RiMapPin2Line className="text-primary me-2" />
          Quick<span>Work</span>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <UserSidebar
        showOnMobile={showMobileSidebar}
        onCloseMobile={() => setShowMobileSidebar(false)}
        onLogout={handleLogout}
        user={{
          name: user?.name || 'User',
          email: user?.email,
          initials: user?.name ? user.name.slice(0, 1).toUpperCase() : 'U',
        }}
      />

      {/* Main Content Area */}
      <main className="qw-main-content">
        <div className="container-fluid p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UserDashboardLayout;
