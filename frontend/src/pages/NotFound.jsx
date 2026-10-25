import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-margin-mobile py-16">
      <SEO
        title="Page Not Found"
        description="The campus page or marketplace listing you requested could not be found."
        noindex={true}
      />
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm">
        <span className="material-symbols-outlined text-[44px]">search_off</span>
      </div>
      <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2">Error 404</span>
      <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface mb-3 tracking-tight">
        Campus Page Not Found
      </h1>
      <p className="text-sm md:text-base text-on-surface-variant max-w-md mb-8 leading-relaxed">
        This listing or page may have expired, been marked as sold, or moved. Let's get you back to active campus listings.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/marketplace"
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-md inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Browse Marketplace
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
