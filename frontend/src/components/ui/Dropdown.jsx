import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Dropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  fullWidth = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimer();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    clearCloseTimer();
    // 300ms grace period before closing on mouse leave
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        clearCloseTimer();
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      clearCloseTimer();
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    clearCloseTimer();
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  const handleToggleClick = (e) => {
    e.preventDefault();
    clearCloseTimer();
    setIsOpen(prev => !prev);
  };

  const currentLabel = React.useMemo(() => {
    if (!value) return placeholder;
    const match = options.find(opt => (typeof opt === 'object' ? opt.value === value : opt === value));
    if (match) {
      return typeof match === 'object' ? match.label : match;
    }
    return value;
  }, [value, options, placeholder]);

  return (
    <StyledWrapper
      $fullWidth={fullWidth}
      className={className}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`menu ${isOpen ? 'menu--open' : ''}`}>
        <div className="item">
          <button
            type="button"
            className="link"
            onClick={handleToggleClick}
            aria-expanded={isOpen}
          >
            <span className="link-text">{currentLabel}</span>
            <svg viewBox="0 0 360 360" xmlSpace="preserve" className="chevron-icon">
              <g id="SVGRepo_iconCarrier">
                <path
                  id="XMLID_225_"
                  d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393 c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393 s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
                />
              </g>
            </svg>
          </button>
          
          <div className="submenu" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {options.map((option, index) => {
              const optVal = typeof option === 'object' ? option.value : option;
              const optLabel = typeof option === 'object' ? option.label : option;
              const isSelected = optVal === value;

              return (
                <div key={index} className={`submenu-item ${isSelected ? 'selected' : ''}`}>
                  <button
                    type="button"
                    className="submenu-link"
                    onClick={() => handleSelect(optVal)}
                  >
                    <span className="submenu-text">{optLabel}</span>
                    {isSelected && (
                      <span className="checkmark material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: ${props => (props.$fullWidth ? '100%' : 'fit-content')};
  position: relative;
  display: block;

  .menu {
    --primary: #4f46e5;
    --primary-hover: #3730a3;
    --bg-main: var(--surface-container-low, #f5f2ff);
    --border-main: var(--outline-variant, #c7c4d8);
    --text-main: var(--on-surface, #1b1b24);
    --text-on-primary: #ffffff;
    --submenu-bg: var(--surface-container-lowest, #ffffff);
    
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    color: var(--text-main);
    width: 100%;
    display: flex;
    list-style: none;
    user-select: none;
  }

  /* Dark mode theme adaptation */
  :global(.dark) .menu,
  .dark .menu {
    --primary: #6366f1;
    --primary-hover: #4f46e5;
    --bg-main: #1e293b;
    --border-main: #475569;
    --text-main: #f8fafc;
    --text-on-primary: #ffffff;
    --submenu-bg: #1e293b;
  }

  .menu button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  .menu .item {
    position: relative;
    width: 100%;
  }

  /* Main trigger link button */
  .menu .link {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 12px;
    width: 100%;
    background-color: var(--bg-main);
    border: 1.5px solid var(--border-main);
    overflow: hidden;
    transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
    color: var(--text-main);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    z-index: 2;
  }

  .menu .link::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--primary);
    z-index: 1;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .menu .link .link-text {
    position: relative;
    z-index: 3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-main);
    font-weight: 600;
    transition: color 0.3s ease;
  }

  .menu .link .chevron-icon {
    position: relative;
    z-index: 3;
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    fill: var(--text-main);
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), fill 0.3s ease;
  }

  /* When Menu is Open */
  .menu.menu--open .link {
    border-color: var(--primary);
    box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2);
  }

  .menu.menu--open .link::after {
    transform: scaleX(1);
    transform-origin: right;
  }

  .menu.menu--open .link .link-text {
    color: var(--text-on-primary) !important;
  }

  .menu.menu--open .link .chevron-icon {
    fill: var(--text-on-primary) !important;
    transform: rotate(-180deg);
  }

  /* Submenu Dropdown Container */
  .menu .item .submenu {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    position: absolute;
    top: 100%;
    padding-top: 6px; /* Space inside container so mouse never leaves */
    border-radius: 14px;
    left: 0;
    width: 100%;
    background: transparent;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1),
                transform 0.3s cubic-bezier(0.23, 1, 0.32, 1),
                visibility 0.3s;
    z-index: 50;
    pointer-events: none;
    list-style: none;
  }

  /* Invisible hover bridge between trigger button and submenu */
  .menu .item .submenu::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    height: 16px;
    z-index: 1;
  }

  /* Open State for Submenu */
  .menu.menu--open .item .submenu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  /* Submenu items list wrapper styling */
  .submenu-item {
    width: 100%;
    background: var(--submenu-bg);
    border-left: 1.5px solid var(--border-main);
    border-right: 1.5px solid var(--border-main);
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  .submenu-item:first-child {
    border-top: 1.5px solid var(--border-main);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .submenu-item:last-child {
    border-bottom: 1.5px solid var(--border-main);
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.08);
  }

  /* When menu is open, highlight border */
  .menu.menu--open .submenu-item {
    border-color: rgba(79, 70, 229, 0.35);
  }

  .submenu .submenu-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 16px;
    width: 100%;
    position: relative;
    text-align: left;
    transition: color 0.3s ease;
    color: var(--text-main);
    z-index: 2;
    overflow: hidden;
  }

  .submenu .submenu-link .submenu-text {
    position: relative;
    z-index: 3;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .submenu .submenu-link .checkmark {
    position: relative;
    z-index: 3;
    color: var(--primary);
    font-weight: bold;
    transition: color 0.3s ease;
  }

  /* Selected item in dropdown */
  .submenu .submenu-item.selected {
    background-color: rgba(79, 70, 229, 0.08);
  }

  .submenu .submenu-item.selected .submenu-text {
    color: var(--primary);
    font-weight: 700;
  }

  /* Sliding hover background effect */
  .submenu .submenu-link::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    transform: scaleX(0);
    width: 100%;
    height: 100%;
    background-color: var(--primary);
    z-index: 1;
    transform-origin: left;
    transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .submenu .submenu-link:hover::before {
    transform: scaleX(1);
    transform-origin: right;
  }

  /* High contrast text on hover */
  .submenu .submenu-link:hover .submenu-text {
    color: var(--text-on-primary) !important;
  }

  .submenu .submenu-link:hover .checkmark {
    color: var(--text-on-primary) !important;
  }
`;

export default Dropdown;
