import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Switch from './Switch';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isMarketplace = location.pathname === '/marketplace';
  const isHowItWorks = location.pathname === '/how-it-works';
  const isChat = location.pathname === '/messages';
  const isSell = location.pathname === '/sell';
  const isAdminPage = location.pathname === '/admin';

  const handleProfileClick = () => {
    if (user) {
      setShowProfileMenu(!showProfileMenu);
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="bg-surface/85 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-outline-variant/15 transition-colors duration-300">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-lg max-w-container-max mx-auto h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-md">
          <Link to="/" className="flex items-center gap-2 font-headline-md text-headline-md font-bold group hover:opacity-95 transition-opacity">
            <img src="/logo.png" alt="CampusLoop Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain shrink-0 group-hover:scale-105 transition-transform duration-200" />
            <span className="animated-gradient-text tracking-tight">CampusLoop</span>
          </Link>
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-md ml-lg">
            <Link
              to="/marketplace"
              className={`font-label-md text-label-md pb-1 border-b-2 transition-all ${
                isMarketplace
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/how-it-works"
              className={`font-label-md text-label-md pb-1 border-b-2 transition-all ${
                isHowItWorks
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/messages"
              className={`font-label-md text-label-md pb-1 border-b-2 transition-all ${
                isChat
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              Chat
            </Link>
            <Link
              to="/sell"
              className={`font-label-md text-label-md pb-1 border-b-2 transition-all ${
                isSell
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              Sell
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`font-label-md text-label-md pb-1 border-b-2 transition-all flex items-center gap-1 ${
                  isAdminPage
                    ? 'text-primary border-primary'
                    : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 border-transparent font-bold'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">shield_person</span>
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search bar inside header, shown on Marketplace on desktop */}
          {isMarketplace && (
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-52 lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-sm text-on-surface outline-none"
                placeholder="Search for textbooks, electronics..."
              />
            </form>
          )}

          {/* Theme Toggle BB-8 Switch */}
          <div className="flex items-center justify-center">
            <Switch size="5.5px" />
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => user ? navigate('/notifications') : navigate('/auth')}
            className="p-2 hover:bg-surface-container-high/60 rounded-lg transition-all duration-200 active:scale-95 relative"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            )}
          </button>

          {/* Profile Menu Button */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={handleProfileClick}
              className="p-2 hover:bg-surface-container-high/60 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center"
              aria-label="Profile menu"
            >
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-outline-variant/30"
                />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && user && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg py-2 z-50">
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 font-bold hover:bg-surface-container-high/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">shield_person</span>
                    Admin Panel
                  </Link>
                )}
                <Link
                  to={`/profile/${user._id}`}
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high/50 transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-error hover:bg-surface-container-high/50 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;