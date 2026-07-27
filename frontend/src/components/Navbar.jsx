import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Navbar = () => {
  const { user, logout } = useAuth();
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
  const isChat = location.pathname === '/messages';
  const isSell = location.pathname === '/sell';

  const handleProfileClick = () => {
    if (user) {
      setShowProfileMenu(!showProfileMenu);
    } else {
      navigate('/auth');
    }
  };

  return (
    <nav className="bg-surface/80 dark:bg-inverse-surface/80 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-lg max-w-container-max mx-auto h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-md">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
            CampusLoop
          </Link>
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-md ml-lg">
            <Link
              to="/marketplace"
              className={`font-label-md text-label-md pb-1 border-b-2 transition-all ${
                isMarketplace
                  ? 'text-primary dark:text-primary-fixed-dim border-primary dark:border-primary-fixed-dim'
                  : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim border-transparent'
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/messages"
              className={`font-label-md text-label-md pb-1 border-b-2 transition-all ${
                isChat
                  ? 'text-primary dark:text-primary-fixed-dim border-primary dark:border-primary-fixed-dim'
                  : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim border-transparent'
              }`}
            >
              Chat
            </Link>
            <Link
              to="/sell"
              className={`font-label-md text-label-md pb-1 border-b-2 transition-all ${
                isSell
                  ? 'text-primary dark:text-primary-fixed-dim border-primary dark:border-primary-fixed-dim'
                  : 'text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed-dim border-transparent'
              }`}
            >
              Sell
            </Link>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-sm">
          {/* Search bar inside header, shown on Marketplace on desktop */}
          {isMarketplace && (
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-64 lg:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-surface-container dark:bg-surface-container-high/40 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-sm text-on-surface outline-none"
                placeholder="Search for textbooks, electronics..."
              />
            </form>
          )}

          {/* Notifications Button */}
          <button
            onClick={() => user ? navigate('/profile/' + user._id) : navigate('/auth')}
            className="p-2 hover:bg-surface-container-high/50 dark:hover:bg-surface-container-highest/10 rounded-lg transition-all duration-200 active:scale-95 relative"
          >
            <span className="material-symbols-outlined text-on-surface-variant dark:text-outline-variant">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            )}
          </button>

          {/* Profile Menu Button */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={handleProfileClick}
              className="p-2 hover:bg-surface-container-high/50 dark:hover:bg-surface-container-highest/10 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center"
            >
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-outline-variant/30"
                />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant dark:text-outline-variant">person</span>
              )}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && user && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 dark:border-outline/30 rounded-xl shadow-lg py-2 z-50">
                <Link
                  to={`/profile/${user._id}`}
                  onClick={() => setShowProfileMenu(false)}
                  className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high/50 dark:hover:bg-surface-container-highest/10 transition-colors"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-error hover:bg-surface-container-high/50 dark:hover:bg-surface-container-highest/10 transition-colors"
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