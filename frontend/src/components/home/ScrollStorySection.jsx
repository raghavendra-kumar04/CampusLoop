import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const scenes = [
  {
    step: '01',
    title: 'Marketplace Built for Students',
    description: 'Buy and sell textbooks, electronics, dorm essentials, and project gear directly with verified classmates.',
    icon: 'storefront',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    step: '02',
    title: 'Verified Peer Community',
    description: 'Every user is authenticated via official university email. Trade safely with people you share a campus with.',
    icon: 'verified_user',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    step: '03',
    title: 'Real-time In-App Chat',
    description: 'Negotiate prices, arrange safe meet-up spots, and get instant updates without giving away private phone numbers.',
    icon: 'chat_bubble',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    step: '04',
    title: 'Everything on Campus. One Place.',
    description: 'Join thousands of students decluttering their dorms, saving money, and discovering opportunities every day.',
    icon: 'all_inclusive',
    color: 'from-purple-600 to-pink-600'
  }
];

export default function ScrollStorySection() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-2xl relative z-10 my-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-xl">
          <span className="font-label-md text-xs uppercase tracking-widest text-primary font-bold">
            The CampusLoop Story
          </span>
          <h2 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface mt-xs tracking-tight">
            How CampusLoop Transforms Your University Experience
          </h2>
        </div>

        {/* Story Grid Progression */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {scenes.map((scene, idx) => (
            <motion.div
              key={scene.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-surface-container-lowest dark:bg-slate-900/60 backdrop-blur-xl p-lg rounded-3xl border border-outline-variant/15 relative overflow-hidden group hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-md">
                <span className="text-4xl font-extrabold text-outline-variant/40 group-hover:text-primary transition-colors">
                  {scene.step}
                </span>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${scene.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-[26px]">{scene.icon}</span>
                </div>
              </div>

              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">
                {scene.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {scene.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Final Convergence CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-xl p-lg md:p-xl rounded-[36px] bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white text-center border border-indigo-500/20 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="font-display-lg text-display-lg text-white mb-sm tracking-tight">
              Ready to experience your campus in one loop?
            </h3>
            <p className="text-body-lg text-slate-300 mb-lg">
              Explore thousands of listings or list your first item in under 2 minutes.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className="px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-lg inline-flex items-center gap-2"
            >
              Enter CampusLoop
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
