import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const faqList = [
  {
    q: 'How does CampusLoop verify that users are real students?',
    a: 'CampusLoop enforces strict institutional email verification (.edu, .ac.in, or verified university domain). Only currently enrolled students, faculty, or staff can activate an account and trade on the platform.',
  },
  {
    q: 'Are there any platform fees or commissions on sales?',
    a: 'No. CampusLoop is 100% free for college students. We do not charge transaction commissions, listing fees, or subscription charges. What you sell is what you keep.',
  },
  {
    q: 'How do buyers and sellers communicate?',
    a: 'CampusLoop features an integrated, real-time in-app chat. Students can ask questions, negotiate fair prices, and coordinate meetup details without disclosing their private phone numbers or personal social media.',
  },
  {
    q: 'Where should students meet to complete the exchange?',
    a: 'We strongly advise meeting in designated public campus safe zones during daytime hours—such as the university library lobby, campus student center, dining hall, or areas monitored by campus security.',
  },
  {
    q: 'What payment methods can students use?',
    a: 'Because transactions are peer-to-peer and conducted in person upon physical inspection, students typically settle payments directly via cash or instant digital payments (UPI, Venmo, Zelle) once satisfied with the item.',
  },
  {
    q: 'What items can be sold on CampusLoop?',
    a: 'Students frequently buy and sell textbooks, course notes, scientific calculators, laptops, headphones, monitors, dorm furniture, microwave ovens, bicycles, and lab equipment. Items violating academic integrity (e.g. test banks) or campus policies are strictly prohibited.',
  },
];

export default function HowItWorks() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://campusloop-nine.vercel.app/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'How It Works',
        item: 'https://campusloop-nine.vercel.app/how-it-works',
      },
    ],
  };

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [faqSchema, breadcrumbSchema],
  };

  return (
    <div className="w-full min-h-screen py-10 px-margin-mobile md:px-lg max-w-5xl mx-auto">
      <SEO
        title="How It Works | CampusLoop Student Marketplace"
        description="Learn how CampusLoop connects verified college students to buy, sell, and exchange textbooks, electronics, and dorm essentials safely with zero fees."
        canonical="/how-it-works"
        schema={combinedSchema}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs md:text-sm text-on-surface-variant">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">home</span>
          Home
        </Link>
        <span>/</span>
        <span className="text-on-surface font-medium" aria-current="page">How It Works</span>
      </nav>

      {/* Hero Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-container-lowest dark:bg-slate-900/70 border border-outline-variant/15 rounded-3xl p-8 md:p-12 mb-10 shadow-sm relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="material-symbols-outlined text-[16px]">school</span>
          Student-to-Student Exchange Guide
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          How CampusLoop Works
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg max-w-3xl leading-relaxed">
          The smart, safe, and zero-fee way to buy and sell on campus. Connect directly with verified classmates, declutter your dorm, and save hundreds on textbooks and gear.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/marketplace"
            className="px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:scale-105 active:scale-95 transition-all shadow-md inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            Browse Marketplace
          </Link>
          <Link
            to="/auth"
            className="px-6 py-3 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Join with Student Email
          </Link>
        </div>
      </motion.header>

      {/* 5-Step Process */}
      <section className="mb-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-2">
            5 Simple Steps to Campus Trading
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant">
            Everything designed for college speed, safety, and community transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/15 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-extrabold text-lg flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Verify Student Email</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Register using your university email address (.edu or .ac.in). This ensures every user on CampusLoop is a real, authenticated student at an academic institution.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/15 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary font-extrabold text-lg flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">List or Discover Items</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              List textbooks, dorm essentials, or electronics in 60 seconds with genuine photos and fair prices. Or search by major, course code, and campus location.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/15 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary font-extrabold text-lg flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Chat Safely In-App</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Message sellers directly inside CampusLoop. Negotiate prices, inspect item photos, and agree on details without ever giving out your personal phone number.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/15 rounded-2xl p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 font-extrabold text-lg flex items-center justify-center mb-4">
              04
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Meet in Campus Safe Zones</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Meet at high-traffic campus spots—like the main library, student union, or dining hall. Check the item in person before sending or accepting payment.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/15 rounded-2xl p-6 relative md:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 font-extrabold text-lg flex items-center justify-center mb-4">
              05
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Build Campus Reputation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Leave authentic peer reviews after completing a trade. Your verified star rating and honest student feedback help keep the entire campus community trusted and dependable.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Manifesto Banner */}
      <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 mb-14 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-2">
            Our Campus Safety Commitment
          </h2>
          <p className="text-sm md:text-base text-on-surface-variant max-w-2xl">
            Zero scams, zero anonymous bots, and zero hidden fees. Learn how our block/report tools and verified community guidelines keep everyone safe.
          </p>
        </div>
        <Link
          to="/terms#safety"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:scale-105 transition-all shadow-sm"
        >
          View Safety Guidelines
        </Link>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section className="mb-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-wider text-primary font-bold">Frequently Asked Questions</span>
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface mt-1">
            Questions About Buying & Selling
          </h2>
        </div>

        <div className="space-y-4">
          {faqList.map((faq, index) => (
            <div
              key={index}
              className="bg-surface-container-lowest dark:bg-slate-900/60 border border-outline-variant/15 rounded-2xl p-6 transition-all"
            >
              <h3 className="text-base md:text-lg font-bold text-on-surface mb-2 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">help_outline</span>
                {faq.q}
              </h3>
              <p className="text-sm md:text-base text-on-surface-variant pl-7 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Conversion CTA */}
      <section className="text-center py-12 px-6 rounded-3xl bg-surface-container-lowest dark:bg-slate-900/80 border border-outline-variant/15 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-3">
          Ready to trade with your campus community?
        </h2>
        <p className="text-sm md:text-base text-on-surface-variant max-w-xl mx-auto mb-6">
          Find college textbooks, gear, and furniture from students right next door.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/marketplace"
            className="px-8 py-3.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Explore Active Listings
          </Link>
          <Link
            to="/auth"
            className="px-8 py-3.5 rounded-full bg-surface-container text-on-surface font-semibold text-sm hover:bg-surface-container-high transition-colors"
          >
            Sign In / Register
          </Link>
        </div>
      </section>
    </div>
  );
}
