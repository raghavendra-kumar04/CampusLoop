import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  return (
    <div className="w-full min-h-screen py-12 px-margin-mobile md:px-lg max-w-5xl mx-auto">
      <SEO
        title="Privacy Policy | CampusLoop"
        description="Learn how CampusLoop protects student data with institutional email verification, encrypted auth, and a strict policy of never selling student information."
        canonical="/privacy"
      />
      {/* Back button & Breadcrumbs */}
      <div className="mb-8 flex items-center gap-2 text-sm text-on-surface-variant">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Home
        </Link>
        <span>/</span>
        <span className="text-on-surface font-medium">Privacy Policy</span>
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-surface-container-lowest dark:bg-slate-900/70 border border-outline-variant/15 rounded-3xl p-8 md:p-12 mb-10 shadow-sm relative overflow-hidden"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="material-symbols-outlined text-[16px]">security</span>
          Student Privacy & Data Trust
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg max-w-3xl leading-relaxed">
          At CampusLoop, we believe student marketplaces must be built on trust, transparency, and uncompromising privacy. We only collect the minimal information necessary to connect students safely across campus.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-outline">
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">event</span>
            Effective Date: October 2026
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            Strict University Domain Protection (.edu / .ac.in)
          </span>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="space-y-8 text-on-surface-variant">
        {/* Section 1 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">1. Scope & Student Verification</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            CampusLoop is an exclusive peer-to-peer student marketplace. Access to browse, list items, and communicate is strictly restricted to verified university students who register with legitimate institutional emails (such as <code className="bg-surface-container px-2 py-0.5 rounded text-primary text-xs">.edu</code>, <code className="bg-surface-container px-2 py-0.5 rounded text-primary text-xs">.ac.in</code>, or approved university domains).
          </p>
          <p className="text-sm md:text-base leading-relaxed">
            By registering, you confirm that you are currently enrolled as a student or affiliated with the associated academic institution.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[22px]">database</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">2. Information We Collect</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            We collect only what is necessary to operate our student marketplace safely:
          </p>
          <ul className="space-y-3 text-sm md:text-base pl-2">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
              <span><strong>Account Credentials:</strong> Full name, university email address, and hashed authentication credentials (passwords are encrypted using bcrypt and are never visible or retrievable in plaintext).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
              <span><strong>Student Profile Details:</strong> Optional details you choose to furnish such as academic major, graduation year, dorm or campus building, bio, and profile avatar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
              <span><strong>Marketplace Listings:</strong> Item title, description, category, price, condition, preferred campus meetup spot, and uploaded product photographs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
              <span><strong>In-App Messages & Chat:</strong> Peer-to-peer messages exchanged through our built-in real-time socket chat system to enable coordinate meetups without disclosing phone numbers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">check_circle</span>
              <span><strong>Transaction Reviews:</strong> Star ratings and written reviews submitted following completed transactions to foster a reliable campus reputation.</span>
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[22px]">visibility</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">3. What Other Students Can See</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/10">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold mb-2 text-sm">
                <span className="material-symbols-outlined text-[18px]">public</span>
                Public to Verified Peers
              </div>
              <ul className="text-xs space-y-1.5 text-on-surface-variant">
                <li>• Display name & profile avatar</li>
                <li>• Academic major & university affiliation</li>
                <li>• Active and past listings</li>
                <li>• Star rating & peer reviews</li>
                <li>• Approximate campus meetup zone</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-surface-container/40 border border-outline-variant/10">
              <div className="flex items-center gap-2 text-red-500 font-semibold mb-2 text-sm">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Strictly Confidential & Private
              </div>
              <ul className="text-xs space-y-1.5 text-on-surface-variant">
                <li>• Encrypted passwords and auth tokens</li>
                <li>• Private block and report history</li>
                <li>• Exact home address or off-campus residence</li>
                <li>• Direct chat messages between other parties</li>
                <li>• Financial payment account credentials</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">4. Zero Sale of Student Data</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed">
            <strong>CampusLoop does not sell, rent, license, or monetize your personal information or student data to third-party advertisers, data aggregators, or marketing firms.</strong> We do not track you across unrelated web properties or build ad-targeting profiles.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[22px]">block</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">5. User Blocking, Reporting & Moderation</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            To ensure safety and prevent harassment, CampusLoop empowers every student with immediate moderation controls:
          </p>
          <ul className="space-y-2 text-sm md:text-base pl-2">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">shield</span>
              <span><strong>User Blocking:</strong> When you block another student, they cannot message you, see your listings, or view your profile. Blocked relationships are reciprocal and private.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">report</span>
              <span><strong>User & Listing Reporting:</strong> You may flag suspicious listings, counterfeit items, prohibited goods, or abusive behavior. Reports are automatically forwarded to CampusLoop administrators for investigation.</span>
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <span className="material-symbols-outlined text-[22px]">delete_forever</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">6. Data Retention & Account Deletion</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            You retain ownership of your content. You may edit or delete any active listing at any time directly through your dashboard. If you graduate, transfer, or wish to delete your CampusLoop account permanently, you can request account deletion by emailing our administration team at <a href="mailto:admin@campusloop.org" className="text-primary underline">admin@campusloop.org</a>. Upon confirmation, your profile, active listings, and credentials will be permanently purged from active databases.
          </p>
        </section>

        {/* Section 7 */}
        <section className="bg-surface-container-lowest dark:bg-slate-900/50 border border-outline-variant/15 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[22px]">contact_support</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-on-surface">7. Contact Us & Privacy Inquiries</h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or how your data is handled on CampusLoop, please reach out directly:
          </p>
          <div className="p-4 rounded-xl bg-surface-container/50 border border-outline-variant/15 text-sm space-y-1">
            <p><strong>CampusLoop Privacy & Safety Team</strong></p>
            <p>Email: <a href="mailto:admin@campusloop.org" className="text-primary hover:underline font-medium">admin@campusloop.org</a></p>
            <p>Address: CampusLoop Student Initiative, University District</p>
          </div>
        </section>
      </div>

      {/* Footer Navigation Bar */}
      <div className="mt-12 pt-6 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
        <span>© 2026 CampusLoop. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-primary underline">
            Terms & Conditions
          </Link>
          <Link to="/marketplace" className="hover:text-primary underline">
            Marketplace Feed
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
