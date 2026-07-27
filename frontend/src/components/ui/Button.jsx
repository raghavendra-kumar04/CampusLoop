import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled = false,
  className = '',
  icon,
}) => {
  const baseStyle = 'inline-flex items-center justify-center gap-xs font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]';
  
  const variants = {
    primary: 'primary-gradient text-white rounded-full px-lg py-3 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01]',
    secondary: 'bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-lg py-3',
    ghost: 'bg-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface rounded-xl px-sm py-2',
    danger: 'bg-error text-on-error hover:bg-error/95 rounded-xl px-lg py-3 hover:shadow-lg hover:shadow-error/20',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-[20px]">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
