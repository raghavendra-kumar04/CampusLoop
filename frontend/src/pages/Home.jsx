import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const res = await axios.get('/api/listings?status=Available');
        // slice first 6 items
        setRecentListings(res.data.slice(0, 6));
      } catch (err) {
        console.error('Error fetching recent listings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentListings();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/marketplace?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <main className="w-full select-none">
      {/* Hero Section */}
      <section className="relative w-full py-xl overflow-hidden transition-all duration-700 ease-out">
        {/* Decorative blur backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-xs bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1.5 rounded-full mb-md shadow-sm border border-tertiary/10">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
            <span className="font-label-md text-label-md">Verified Student-Only Network</span>
          </div>

          <h1 className="font-display-lg text-display-lg text-on-surface mb-sm max-w-3xl tracking-tight leading-none">
            Your Campus, <span className="text-primary-container">Your Marketplace</span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-2xl">
            The premium way for students to buy, sell, and exchange. Join thousands of verified peers in your university community.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl p-2 shadow-lg flex items-center gap-sm mb-md group focus-within:ring-2 focus-within:ring-primary-container transition-all"
          >
            <div className="flex-1 flex items-center px-sm gap-sm">
              <span className="material-symbols-outlined text-outline">search</span>
              <input
                className="w-full bg-transparent border-none focus:ring-0 text-body-md outline-none text-on-surface"
                placeholder="Search for textbooks, electronics, or dorm decor..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-primary-container text-on-primary-container px-lg py-3 rounded-xl font-label-md text-label-md hover:opacity-90 transition-opacity active:scale-95 shrink-0"
            >
              Start Browsing
            </button>
          </form>

          {/* Chips / Categories */}
          <div className="flex flex-wrap justify-center gap-sm">
            <button
              onClick={() => handleCategoryClick('Electronics')}
              className="flex items-center gap-xs bg-surface-container px-sm py-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
              <span className="font-label-md text-label-md">Electronics</span>
            </button>
            <button
              onClick={() => handleCategoryClick('Textbooks')}
              className="flex items-center gap-xs bg-surface-container px-sm py-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="font-label-md text-label-md">Textbooks</span>
            </button>
            <button
              onClick={() => handleCategoryClick('Furniture')}
              className="flex items-center gap-xs bg-surface-container px-sm py-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">bed</span>
              <span className="font-label-md text-label-md">Furniture</span>
            </button>
            <button
              onClick={() => handleCategoryClick('Clothing')}
              className="flex items-center gap-xs bg-surface-container px-sm py-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">checkroom</span>
              <span className="font-label-md text-label-md">Clothing</span>
            </button>
          </div>
        </div>
      </section>

      {/* Recently Added (Horizontal Scroll) */}
      <section className="w-full py-lg bg-surface-container-low/30 overflow-hidden transition-all duration-700 ease-out">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg">
          <div className="flex justify-between items-end mb-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Recently Added</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Fresh listings from your university area.</p>
            </div>
            <Link to="/marketplace" className="text-primary font-label-md text-label-md hover:underline">
              View All
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-gutter pb-sm hide-scrollbar -mx-4 px-4">
            {loading ? (
              // Skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-none w-72 bg-surface-container-lowest rounded-2xl p-base border border-outline-variant/10">
                  <div className="skeleton w-full aspect-[4/3] rounded-xl mb-sm"></div>
                  <div className="px-sm pb-sm space-y-md">
                    <div className="flex justify-between">
                      <div className="skeleton h-6 w-3/4 rounded"></div>
                      <div className="skeleton h-6 w-10 rounded"></div>
                    </div>
                    <div className="skeleton h-4 w-1/2 rounded"></div>
                  </div>
                </div>
              ))
            ) : recentListings.length > 0 ? (
              recentListings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} widthClass="flex-none w-72" />
              ))
            ) : (
              <div className="w-full py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[48px] text-outline-variant mb-sm">storefront</span>
                <p className="font-body-md text-on-surface-variant">No items listed from your university area yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid: Trending & Recommended */}
      <section className="w-full py-xl max-w-container-max mx-auto px-margin-mobile md:px-lg transition-all duration-700 ease-out">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Trending Items (Large Bento Card) */}
          <div className="md:col-span-8 bg-surface-container rounded-[32px] p-lg relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center gap-sm mb-sm">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    trending_up
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Trending Now</h2>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-md">
                  What your classmates are looking for right now. High demand, fast sales.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mt-auto">
                {/* Trending Mini Card 1 */}
                <div
                  onClick={() => navigate('/marketplace?search=Sony')}
                  className="bg-surface-container-lowest p-sm rounded-2xl flex items-center gap-sm hover:shadow-md transition-shadow cursor-pointer border border-outline-variant/10"
                >
                  <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Sony Headphones"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqqSSpoDSZCdipgQzuIo2RfBQRgEDcN4340FtMdEZJ05EVOD8LY7Teee620NB1y5QgnTPIYNYooMi3HF0nM5sRhY1TSUnj62MD6BzfgRtDzSWPieXWTHIKYjLD6cwztEW6eBLwl8IaSMvuJ_3qMVxkdTwx5-9nutxeLiU5ezikjZpJD1_royntYw5ViYoNrpBHnYo4HjojZNWxPDL6OGOBS443ApbJpSwSfQsmsNACUlwxMO-vGeq8PQ"
                    />
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Sony WH-1000XM4</h4>
                    <p className="text-tertiary font-bold text-headline-md leading-none">₹180</p>
                  </div>
                </div>

                {/* Trending Mini Card 2 */}
                <div
                  onClick={() => navigate('/marketplace?search=Nespresso')}
                  className="bg-surface-container-lowest p-sm rounded-2xl flex items-center gap-sm hover:shadow-md transition-shadow cursor-pointer border border-outline-variant/10"
                >
                  <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Nespresso Mini"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwGAqbVqNNundxO5Jy1XOrRHr9b24to48IpIaI_YXFrBRVOC_28rXTaBkGKMIdkmYCx-4J7YVDok2IJsJF5U5fhRdDzipSaVrbdWBByG0tZw83fTVazcEpYNbZa_tjZIQQ7hMzq5wVAOY0JyglMwRiBi6AIvAosF4y4V57ZKfilTDcgz4FHXFXDem6_Ben16wRMDS5UkUDC_1Ba3R27nNGwxRshAoD-6Dk7QfJj_QAMAQl2soYXJgoZQ"
                    />
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface">Nespresso Mini</h4>
                    <p className="text-tertiary font-bold text-headline-md leading-none">₹40</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
          </div>

          {/* Recommended (Side Bento Card) */}
          <div className="md:col-span-4 bg-primary-container text-on-primary-container rounded-[32px] p-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-sm mb-sm justify-start">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <h2 className="font-headline-md text-headline-md">Recommended</h2>
              </div>
              <p className="font-body-md text-body-md opacity-80 mb-lg">Based on your browsing history and major.</p>

              <div className="space-y-sm">
                <div
                  onClick={() => navigate('/marketplace?search=TI-84')}
                  className="bg-on-primary-container/10 p-sm rounded-2xl border border-on-primary-container/10 hover:bg-on-primary-container/20 transition-colors cursor-pointer text-left"
                >
                  <span className="font-caption text-caption text-primary-fixed-dim uppercase tracking-widest mb-1 block">
                    Engineering
                  </span>
                  <h4 className="font-label-md text-label-md mb-xs text-on-primary-container">TI-84 Plus Calculator</h4>
                  <p className="text-[18px] font-bold text-tertiary-fixed-dim">₹35</p>
                </div>

                <div
                  onClick={() => navigate('/marketplace?search=Mirror')}
                  className="bg-on-primary-container/10 p-sm rounded-2xl border border-on-primary-container/10 hover:bg-on-primary-container/20 transition-colors cursor-pointer text-left"
                >
                  <span className="font-caption text-caption text-primary-fixed-dim uppercase tracking-widest mb-1 block">
                    Housing
                  </span>
                  <h4 className="font-label-md text-label-md mb-xs text-on-primary-container">Full-Length Mirror</h4>
                  <p className="text-[18px] font-bold text-tertiary-fixed-dim">₹15</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/marketplace')}
              className="w-full mt-lg py-3 rounded-xl bg-surface-container-lowest text-primary font-label-md text-label-md hover:scale-105 transition-transform active:scale-95"
            >
              Browse Full Feed
            </button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="w-full py-xl bg-surface-container-lowest transition-all duration-700 ease-out">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg flex flex-col md:flex-row items-center gap-xl">
          <div className="md:w-1/2 relative w-full">
            <div className="w-full aspect-square max-w-md mx-auto bg-surface-container rounded-[40px] flex items-center justify-center p-xl relative overflow-hidden">
              <span
                className="material-symbols-outlined text-[160px] text-primary/10 absolute -top-10 -left-10"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield_person
              </span>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 bg-primary-container rounded-full flex items-center justify-center mb-md shadow-lg">
                  <span className="material-symbols-outlined text-[64px] text-on-primary-container">verified_user</span>
                </div>
                <div className="bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md px-4 py-2 rounded-full shadow-sm">
                  100% Student Verified
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 text-left">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md">Safety Built for Campus Life</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
              CampusLoop is exclusive to students with a valid university email address. We verify every profile to ensure a trustworthy environment where you can buy and sell with confidence.
            </p>
            <ul className="space-y-sm">
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">.edu Email Verification</h4>
                  <p className="text-caption font-caption text-on-surface-variant">Only current students can join.</p>
                </div>
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">In-App Secure Chat</h4>
                  <p className="text-caption font-caption text-on-surface-variant">Communicate safely without sharing phone numbers.</p>
                </div>
              </li>
              <li className="flex items-start gap-sm">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Hand-to-Hand Exchange</h4>
                  <p className="text-caption font-caption text-on-surface-variant">Meet in public campus safe-zones.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-xl px-margin-mobile md:px-lg transition-all duration-700 ease-out">
        <div className="max-w-container-max mx-auto bg-inverse-surface text-inverse-on-surface rounded-[40px] p-lg md:p-xl flex flex-col items-center text-center">
          <h2 className="font-display-lg text-[40px] md:text-display-lg mb-sm">Ready to declutter your dorm?</h2>
          <p className="font-body-lg text-body-lg opacity-80 mb-lg max-w-2xl">
            List your first item in less than 2 minutes. Free for all students.
          </p>
          <div className="flex flex-col sm:flex-row gap-sm">
            <button
              onClick={() => navigate('/sell')}
              className="bg-primary-container text-on-primary-container px-xl py-4 rounded-full font-headline-md text-[18px] hover:scale-105 transition-transform active:scale-95 shadow-lg shrink-0 font-semibold"
            >
              List an Item
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-transparent border border-outline text-inverse-on-surface px-xl py-4 rounded-full font-headline-md text-[18px] hover:bg-on-surface/10 transition-colors shrink-0 font-semibold"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;