import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getItemStyle = (path) => {
    return isActive(path)
      ? 'flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-xl px-4 py-1 active:scale-90 transition-transform duration-200 cursor-pointer'
      : 'flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant px-4 py-1 hover:bg-surface-container-low dark:hover:bg-surface-container-highest/20 transition-colors duration-200 cursor-pointer';
  };

  const getIconStyle = (path) => {
    return isActive(path)
      ? { fontVariationSettings: "'FILL' 1" }
      : { fontVariationSettings: "'FILL' 0" };
  };

  const handleNavClick = (targetPath, requiresAuth) => {
    if (requiresAuth && !user) {
      navigate('/auth');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-lg shadow-lg rounded-t-xl border-t border-outline-variant/10">
      <button
        onClick={() => handleNavClick('/marketplace', false)}
        className={getItemStyle('/marketplace')}
      >
        <span className="material-symbols-outlined" style={getIconStyle('/marketplace')}>
          storefront
        </span>
        <span className="font-label-md text-[10px]">Browse</span>
      </button>

      <button
        onClick={() => handleNavClick('/messages', true)}
        className={getItemStyle('/messages')}
      >
        <span className="material-symbols-outlined" style={getIconStyle('/messages')}>
          chat
        </span>
        <span className="font-label-md text-[10px]">Chat</span>
      </button>

      <button
        onClick={() => handleNavClick('/sell', true)}
        className={getItemStyle('/sell')}
      >
        <span className="material-symbols-outlined" style={getIconStyle('/sell')}>
          add_circle
        </span>
        <span className="font-label-md text-[10px]">Sell</span>
      </button>

      <button
        onClick={() => handleNavClick(user ? `/profile/${user._id}` : '/auth', true)}
        className={getItemStyle(user ? `/profile/${user._id}` : '/auth')}
      >
        <span className="material-symbols-outlined" style={getIconStyle(user ? `/profile/${user._id}` : '/auth')}>
          person
        </span>
        <span className="font-label-md text-[10px]">Profile</span>
      </button>
    </nav>
  );
};

export default BottomNavbar;
