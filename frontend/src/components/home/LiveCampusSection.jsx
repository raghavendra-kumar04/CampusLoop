import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import axios from 'axios';

function AnimatedCounter({ value, duration = 2 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const [displayVal, setDisplayVal] = useState('0');

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplayVal(Math.round(latest).toLocaleString())
    });
    return controls.stop;
  }, [value, duration, count]);

  return <span>{displayVal}</span>;
}

export default function LiveCampusSection() {
  const [stats, setStats] = useState({
    studentsConnected: 1240,
    activeListings: 327,
    eventsDiscovered: 84,
    newListingsToday: 12
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/stats/live');
        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Using fallback live stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="w-full py-xl relative z-10 transition-all duration-700">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-lg gap-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-label-md text-xs mb-xs border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold uppercase tracking-wider">Live Campus Feed</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg md:text-display-lg text-on-surface tracking-tight">
              What's Happening Right Now
            </h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
            Real-time activity across your campus community today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Card 1: Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-surface-container-lowest dark:bg-slate-900/60 backdrop-blur-xl p-lg rounded-3xl border border-outline-variant/15 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
          >
            <div className="flex justify-between items-center mb-md">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">groups</span>
              </div>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <h3 className="font-display-lg text-[40px] font-extrabold text-on-surface mb-xs tracking-tight">
              <AnimatedCounter value={stats.studentsConnected} />
            </h3>
            <p className="font-label-md text-label-md text-on-surface-variant">Students Connected</p>
          </motion.div>

          {/* Card 2: Active Listings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-surface-container-lowest dark:bg-slate-900/60 backdrop-blur-xl p-lg rounded-3xl border border-outline-variant/15 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
          >
            <div className="flex justify-between items-center mb-md">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-container/20 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">storefront</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                +{stats.newListingsToday} today
              </span>
            </div>
            <h3 className="font-display-lg text-[40px] font-extrabold text-on-surface mb-xs tracking-tight">
              <AnimatedCounter value={stats.activeListings} />
            </h3>
            <p className="font-label-md text-label-md text-on-surface-variant">Active Marketplace Listings</p>
          </motion.div>

          {/* Card 3: Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-surface-container-lowest dark:bg-slate-900/60 backdrop-blur-xl p-lg rounded-3xl border border-outline-variant/15 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
          >
            <div className="flex justify-between items-center mb-md">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">event</span>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                This week
              </span>
            </div>
            <h3 className="font-display-lg text-[40px] font-extrabold text-on-surface mb-xs tracking-tight">
              <AnimatedCounter value={stats.eventsDiscovered} />
            </h3>
            <p className="font-label-md text-label-md text-on-surface-variant">Campus Events & Activities</p>
          </motion.div>

          {/* Card 4: Verified Safe Network */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-surface-container-lowest dark:bg-slate-900/60 backdrop-blur-xl p-lg rounded-3xl border border-outline-variant/15 hover:border-primary/30 transition-all duration-300 hover:shadow-xl group"
          >
            <div className="flex justify-between items-center mb-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[28px]">verified_user</span>
              </div>
              <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                100% .edu
              </span>
            </div>
            <h3 className="font-display-lg text-[40px] font-extrabold text-on-surface mb-xs tracking-tight">
              100%
            </h3>
            <p className="font-label-md text-label-md text-on-surface-variant">Verified Student Exchange</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
