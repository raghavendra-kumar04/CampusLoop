import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ListingCard from '../ListingCard';

export default function ForYouSection({ recentListings = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Rule-based personalization algorithm
  const personalizedContent = useMemo(() => {
    // Determine user category interest bias
    let userMajor = user?.major || 'General';
    let savedCount = user?.savedItems?.length || 0;

    // Pick 2 personalized listings from recentListings
    const featuredListings = recentListings.slice(0, 2);

    return {
      major: userMajor,
      savedCount,
      featuredListings
    };
  }, [user, recentListings]);

  return (
    <section className="w-full py-xl relative z-10 transition-all duration-700">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-lg">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-md text-xs mb-xs border border-primary/20">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span className="font-semibold uppercase tracking-wider">Personalized Feed</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg md:text-display-lg text-on-surface tracking-tight">
              Picked For You
            </h2>
          </div>
          {user && (
            <span className="text-caption font-caption text-on-surface-variant hidden sm:inline-block">
              Tailored for {user.name} ({user.major || 'Student'})
            </span>
          )}
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Main Recommended Items (Col span 8) */}
          <div className="md:col-span-8 space-y-gutter">
            {personalizedContent.featuredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
                {personalizedContent.featuredListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} widthClass="w-full" />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest dark:bg-slate-900/60 p-lg rounded-3xl border border-outline-variant/15 flex flex-col items-center justify-center text-center h-full min-h-[240px]">
                <span className="material-symbols-outlined text-[48px] text-primary/40 mb-xs">auto_awesome</span>
                <h4 className="font-headline-md text-on-surface mb-xs">Discover Campus Gear</h4>
                <p className="font-body-md text-on-surface-variant max-w-sm mb-md">
                  Explore items tailored to your major and campus activities.
                </p>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-label-md hover:bg-primary-container transition-all"
                >
                  Browse Marketplace
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Events & Opportunity Cards (Col span 4) */}
          <div className="md:col-span-4 space-y-gutter flex flex-col justify-between">
            {/* Recommendation Card 1: Event */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => navigate('/marketplace?category=Electronics')}
              className="bg-gradient-to-br from-indigo-900/80 to-slate-900/90 text-white p-lg rounded-3xl border border-indigo-500/20 shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-label-md text-xs uppercase tracking-wider mb-sm inline-block">
                  Upcoming Workshop
                </span>
                <h3 className="font-headline-md text-headline-md text-white mb-xs">
                  AI & ML Engineering Meetup
                </h3>
                <p className="text-body-md text-slate-300 text-sm mb-md">
                  Tomorrow · 4:30 PM · Student Union Center
                </p>
              </div>
              <div className="flex items-center justify-between pt-xs border-t border-white/10">
                <span className="text-xs text-indigo-300 font-medium">34 Peers Registered</span>
                <span className="material-symbols-outlined text-[20px] text-white">arrow_forward</span>
              </div>
            </motion.div>

            {/* Recommendation Card 2: Team / Opportunity */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => navigate('/marketplace?search=Hackathon')}
              className="bg-surface-container-lowest dark:bg-slate-900/60 backdrop-blur-xl p-lg rounded-3xl border border-outline-variant/15 shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-emerald-500">groups</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Campus Opportunity
                </span>
              </div>
              <h4 className="font-headline-md text-[18px] text-on-surface mb-xs">
                Hackathon Team — Looking for 2 members
              </h4>
              <p className="font-body-md text-sm text-on-surface-variant mb-sm">
                Building a React + Python ML project for Campus Tech Week.
              </p>
              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                Connect with Team <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
