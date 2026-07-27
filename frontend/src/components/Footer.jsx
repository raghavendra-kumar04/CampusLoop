import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest dark:bg-inverse-surface full-width border-t border-outline-variant dark:border-outline mt-xl mb-16 md:mb-0">
      <div className="w-full py-lg px-margin-mobile md:px-lg flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto">
        <div className="flex flex-col items-center md:items-start mb-md md:mb-0">
          <span className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface font-bold">
            CampusLoop
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            © 2026 CampusLoop. Student-exclusive marketplace.
          </p>
        </div>
        <div className="flex gap-lg">
          <a href="#" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all">
            About
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all">
            Safety
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all">
            Terms
          </a>
          <a href="#" className="text-on-surface-variant hover:text-primary dark:text-outline-variant hover:underline transition-all">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
