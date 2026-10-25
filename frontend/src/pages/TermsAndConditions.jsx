import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const TermsAndConditions = () => {
  const location = useLocation();

  // Scroll to hash anchor if present (e.g., #safety)
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <div className="w-full min-h-screen py-12 px-margin-mobile md:px-lg max-w-5xl mx-auto">
      <SEO
        title="Terms & Conditions | CampusLoop"
        description="Review the CampusLoop Terms & Conditions, student marketplace community standards, prohibited item rules, and safe campus exchange guidelines."
        canonical="/terms"
      />
      {/* Back button & Breadcrumbs */}
      <div className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Home
        </Link>
        <span>/</span>
        <span className="text-on-surface font-medium">Terms & Conditions</span>
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-container-lowest dark:bg-slate-900/70 border border-outline-variant/15 rounded-3xl p-8 md:p-12 mb-10 shadow-sm relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="material-symbols-outlined text-[16px]">gavel</span>
          Student Agreement & Marketplace Code
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          Terms & Conditions
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg max-w-3xl leading-relaxed">
          Welcome to CampusLoop. These Terms and Conditions govern your access to and use of our student-exclusive marketplace, communication tools, and campus community services.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-outline">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">event</span>
            Last Revised: October 2026
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">handshake</span>
            Peer-to-Peer Student Trading
          </span>
        </div>
      </motion.div>

      {/* Sections List */}
      <div className="space-y-8 text-on-surface-variant">
        {/* Section 1 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">1. Eligibility & University Email Verification</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            CampusLoop is reserved exclusively for registered students and faculty of verified colleges and universities. You must possess and authenticate with an active institutional email address (<code className="bg-surface-container px-2 py-0.5 rounded text-primary text-xs">.edu</code>, <code className="bg-surface-container px-2 py-0.5 rounded text-primary text-xs">.ac.in</code>, or verified university domain).
          </p>
          <p className="text-sm md:text-base leading-relaxed">
            Accounts created with disposable, generic (e.g. Gmail/Yahoo without campus affiliation), or fraudulent email addresses are subject to immediate termination. You are responsible for safeguarding your password and account session.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">2. Marketplace Model & Zero Platform Fees</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            CampusLoop functions as a decentralized campus communication and listing discovery portal. We do not act as an escrow agent, broker, or payment processor, and we charge <strong>zero platform fees or commissions</strong> on student-to-student transactions.
          </p>
          <p className="text-sm md:text-base leading-relaxed">
            Contracts for sales, exchanges, or rentals are created directly between the buyer and seller. Both parties are encouraged to inspect items in person before finalizing any transaction.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[22px]">block</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">3. Prohibited Listings & Academic Integrity</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            To preserve a safe and ethical university environment, the following items and behaviors are <strong>strictly prohibited</strong> on CampusLoop:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
            <div className="p-3 rounded-xl bg-error/5 border border-error/15 text-on-surface">
              <strong className="text-error flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px]">school</span>
                Academic Dishonesty Materials
              </strong>
              Exam questions, live quiz banks, assignment solutions for graded coursework, proxy test-taking, or paper-writing services.
            </div>
            <div className="p-3 rounded-xl bg-error/5 border border-error/15 text-on-surface">
              <strong className="text-error flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Weapons & Controlled Substances
              </strong>
              Firearms, knives, fireworks, prescription medication, recreational drugs, alcohol, vaping devices, or tobacco products.
            </div>
            <div className="p-3 rounded-xl bg-error/5 border border-error/15 text-on-surface">
              <strong className="text-error flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                Stolen or University Property
              </strong>
              Campus library books, university lab hardware, master dorm keys, stolen electronics, or counterfeit designer goods.
            </div>
            <div className="p-3 rounded-xl bg-error/5 border border-error/15 text-on-surface">
              <strong className="text-error flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                Commercial Spam & Pyramids
              </strong>
              Non-student commercial advertising, multi-level marketing (MLM) promotions, unauthorized crypto solicitations, or affiliate links.
            </div>
          </div>
        </section>

        {/* Section 4 - Safety */}
        <section id="safety" className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
              <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">4. Campus Meetup & Safe Trading Guidelines</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            Personal safety is paramount. All physical exchanges must abide by safe campus trading practices:
          </p>
          <ul className="space-y-2.5 text-sm md:text-base pl-2">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[18px] mt-0.5">check_circle</span>
              <span><strong>Designated Safe Zones:</strong> Always meet in well-lit, public areas with high foot traffic—such as the university library lobby, campus student center, campus dining hall, or areas monitored by campus security.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[18px] mt-0.5">check_circle</span>
              <span><strong>Daylight Hours:</strong> Schedule exchanges during daytime hours whenever feasible.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[18px] mt-0.5">check_circle</span>
              <span><strong>Inspect Before Payment:</strong> Thoroughly test electronics, inspect textbook editions, and verify item conditions prior to handing over cash or sending peer-to-peer digital payments.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[18px] mt-0.5">check_circle</span>
              <span><strong>Use In-App Chat:</strong> Keep all deal communication inside CampusLoop's secure real-time chat so a record is available in case of dispute.</span>
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[22px]">reviews</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">5. Authentic Reviews & Reputation Standards</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            CampusLoop enforces strict authenticity across its feedback loop. Reviews may only be submitted following genuine peer transactions. We prohibit:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm md:text-base">
            <li>Submitting fake, incentivized, or retaliatory reviews.</li>
            <li>Review coercion or blackmail (e.g. threatening negative reviews to force price drops).</li>
            <li>Using multiple or puppet accounts to inflate seller ratings.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">6. Moderation, Reporting & Account Actions</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            CampusLoop administrators reserve the right to review listings, investigate user reports, hide non-compliant posts, restrict chat capabilities, or suspend user accounts without prior notice if these Terms or campus codes of conduct are violated.
          </p>
          <p className="text-sm md:text-base leading-relaxed">
            Severe infractions involving theft, threats, harassment, or academic misconduct may be escalated to the appropriate university disciplinary board or campus security office.
          </p>
        </section>

        {/* Section 7 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-outline-variant/20 flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[22px]">info</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">7. Disclaimer of Warranties & Limitation of Liability</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            CampusLoop is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no representations or warranties concerning the condition, safety, legality, or quality of items listed by students. CampusLoop is not liable for financial loss, property damage, personal disputes, or failed transactions between students.
          </p>
        </section>

        {/* Section 8 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">mail</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">8. Contact Information</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-3">
            For questions about these Terms & Conditions or to report a violation, please contact our administrative moderation team:
          </p>
          <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/15 text-sm space-y-1">
            <p><strong>CampusLoop Community Moderation</strong></p>
            <p>Email: <a href="mailto:admin@campusloop.org" className="text-primary hover:underline font-medium">admin@campusloop.org</a></p>
          </div>
        </section>
      </div>

      {/* Footer Navigation Bar */}
      <div className="mt-12 pt-6 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
        <span>© 2026 CampusLoop. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-primary underline">
            Privacy Policy
          </Link>
          <Link to="/marketplace" className="hover:text-primary underline">
            Marketplace Feed
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
