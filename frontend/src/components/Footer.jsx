import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface full-width border-t border-outline-variant dark:border-outline mt-xl mb-16 md:mb-0">
      <div className="w-full py-lg px-margin-mobile md:px-lg flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto">
        <div className="flex flex-col items-center md:items-start mb-md md:mb-0">
          <Link to="/" className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface font-bold hover:text-primary transition-colors">
            CampusLoop
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            © 2026 CampusLoop. Student-exclusive marketplace.
          </p>
        </div>
        <div className="flex flex-wrap gap-md md:gap-lg items-center justify-center md:justify-end">
          <Link to="/marketplace" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all text-sm font-medium">
            Marketplace
          </Link>
          <Link to="/how-it-works" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all text-sm font-medium">
            How It Works
          </Link>
          <Link to="/terms#safety" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all text-sm font-medium">
            Campus Safety
          </Link>
          <Link to="/terms" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all text-sm font-medium">
            Terms & Conditions
          </Link>
          <Link to="/privacy" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all text-sm font-medium">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
