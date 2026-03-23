import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import LocationModal from '../landingPage/components/LocationModal';
import type { Location } from '../landingPage/services/landingService';

interface HeaderProps {
  locations?: Location[];
  selectedLocation?: Location | null;
  onSelectLocation?: (location: Location) => void;
  onClearLocation?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  locations = [],
  selectedLocation,
  onSelectLocation,
  onClearLocation,
}) => {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem('token');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('locationId');
    onClearLocation?.();
    navigate('/auth/login');
  };

  const handleSelect = (loc: Location) => {
    onSelectLocation?.(loc);
    setModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.navbar') && !target.closest('.profile-dropdown')) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top" style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8edf5',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
        minHeight: 64,
      }}>
        <div className="container">
           <a className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="/">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#fff', fontWeight: 800,
            }}>Q</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Quick<span style={{ color: '#3b82f6' }}>Work</span>
            </span>
          </a>

          <button className="navbar-toggler border-0" type="button" onClick={() => setNavOpen(!navOpen)}>
            <span className="navbar-toggler-icon" />
          </button>

          <div className={`collapse navbar-collapse${navOpen ? ' show' : ''}`}>
             <ul className="navbar-nav mx-auto gap-1">
              {[['Browse Services', '/user/services'], ['How it Works', '/#how-it-works'], ['Create Job', '/user/create-job']].map(([label, href]) => (
                <li className="nav-item" key={label}>
                  <a
                    href={href}
                    className="nav-link px-3"
                    style={{ fontSize: 14, fontWeight: 500, color: '#475569', borderRadius: 8, transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1e293b'; (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#475569'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

             <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
               <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                  border: '1.5px solid',
                  borderColor: selectedLocation ? '#bfdbfe' : '#e2e8f0',
                  background: selectedLocation ? '#eff6ff' : '#f8fafc',
                  fontSize: 13, fontWeight: 600,
                  color: selectedLocation ? '#1d4ed8' : '#64748b',
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                <span>📍</span>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedLocation?.name ?? 'Choose Location'}
                </span>
              </button>
                
              {token ? (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "26px"
                    }}
                  >             
                    <FaUserCircle />
              
                  </button>
                  {profileOpen && (                    
                    <div                      
      style={{
        position: "absolute",
        right: 0,
        top: 40,
        width: 160,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        overflow: "hidden",
        zIndex: 1000
      }}
    >
      <div
        onClick={() => navigate("/profile")}
        style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14 }}
      >
        Profile
      </div>

      <div
        onClick={() => navigate("/my-jobs")}
        style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14 }}
      >
        My Jobs
      </div>

      <div
        onClick={() => navigate("/messages")}
        style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14 }}
      >
        Messages
      </div>

      <div
        onClick={handleLogout}
        style={{
          padding: "10px 14px",
          cursor: "pointer",
          fontSize: 14,
          color: "#ef4444",
          borderTop: "1px solid #f1f5f9"
        }}
      >
        Logout
      </div>
    </div>
  )}
      </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/auth/login')}
                    style={{
                      padding: '8px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0',
                      background: '#fff', color: '#1e293b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/auth/signup')}
                    style={{
                      padding: '8px 18px', borderRadius: 10, border: 'none',
                      background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LocationModal
        isOpen={modalOpen}
        locations={locations}
        selectedLocationId={selectedLocation?._id}
        onSelect={handleSelect}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default Header;
