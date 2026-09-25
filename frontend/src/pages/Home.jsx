import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import LiveCampusSection from '../components/home/LiveCampusSection';
import ForYouSection from '../components/home/ForYouSection';
import ScrollStorySection from '../components/home/ScrollStorySection';
import CampusLoopOrb from '../components/CampusLoopOrb';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        const res = await axios.get('/api/listings?status=Available');
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
    <main className="w-full select-none relative z-10">
      {/* Hero Section with 3D CampusLoop Orb */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full py-xl overflow-hidden transition-all duration-700 ease-out"
      >
        {/* Decorative blur backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg grid grid-cols-1 lg:grid-cols-12 items-center gap-lg relative z-10">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-xs bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1.5 rounded-full mb-md shadow-sm border border-tertiary/10">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="font-label-md text-label-md">Verified Student-Only Network</span>
            </div>

            <h1 className="font-display-lg text-display-lg lg:text-[56px] text-on-surface mb-sm max-w-2xl tracking-tight leading-none">
              Your Campus, <span className="text-primary-container">Your Marketplace</span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-xl">
              The premium way for students to buy, sell, and exchange. Join thousands of verified peers in your university community.
            </p>

            {/* Hero Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="w-full max-w-2xl bg-surface-container-lowest dark:bg-slate-900/90 rounded-2xl p-2 shadow-xl flex items-center gap-sm mb-md group focus-within:ring-2 focus-within:ring-primary-container border border-outline-variant/15 transition-all"
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
              <StyledWrapper>
                <button type="submit" className="button bg-primary-container text-white">
                  Start Browsing
                  <svg className="icon " viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
                  </svg>
                </button>
              </StyledWrapper>
            </form>

            {/* Category Chips */}
            <StyledWrapper>
              <div className="flex flex-wrap justify-center lg:justify-start gap-sm mt-2">
                {[
                  { name: 'Electronics', icon: 'laptop_mac' },
                  { name: 'Textbooks', icon: 'menu_book' },
                  { name: 'Furniture', icon: 'bed' },
                  { name: 'Clothing', icon: 'checkroom' }
                ].map((cat) => (
                  <button key={cat.name} className="category-btn bg-surface-container hover:bg-surface-container-high text-on-surface" onClick={() => handleCategoryClick(cat.name)}>
                    <span className="folderContainer">
                      <svg className="fileBack" width={146} height={113} viewBox="0 0 146 113" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 4C0 1.79086 1.79086 0 4 0H50.3802C51.8285 0 53.2056 0.627965 54.1553 1.72142L64.3303 13.4371C65.2799 14.5306 66.657 15.1585 68.1053 15.1585H141.509C143.718 15.1585 145.509 16.9494 145.509 19.1585V109C145.509 111.209 143.718 113 141.509 113H3.99999C1.79085 113 0 111.209 0 109V4Z" fill="url(#paint0_linear_117_4)" />
                        <defs>
                          <linearGradient id="paint0_linear_117_4" x1={0} y1={0} x2="72.93" y2="95.4804" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#8F88C2" />
                            <stop offset={1} stopColor="#5C52A2" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="filePage relative flex items-center justify-center">
                        <svg width="100%" height="100%" viewBox="0 0 88 99" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width={88} height={99} fill="url(#paint0_linear_117_6)" />
                          <defs>
                            <linearGradient id="paint0_linear_117_6" x1={0} y1={0} x2={81} y2="160.5" gradientUnits="userSpaceOnUse">
                              <stop stopColor="white" />
                              <stop offset={1} stopColor="#686868" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="material-symbols-outlined absolute text-gray-700 text-[14px]">{cat.icon}</span>
                      </div>
                      <svg className="fileFront" width={160} height={79} viewBox="0 0 160 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.29306 12.2478C0.133905 9.38186 2.41499 6.97059 5.28537 6.97059H30.419H58.1902C59.5751 6.97059 60.9288 6.55982 62.0802 5.79025L68.977 1.18034C70.1283 0.410771 71.482 0 72.8669 0H77H155.462C157.87 0 159.733 2.1129 159.43 4.50232L150.443 75.5023C150.19 77.5013 148.489 79 146.474 79H7.78403C5.66106 79 3.9079 77.3415 3.79019 75.2218L0.29306 12.2478Z" fill="url(#paint0_linear_117_5)" />
                        <defs>
                          <linearGradient id="paint0_linear_117_5" x1="38.7619" y1="8.71323" x2="66.9106" y2="82.8317" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#C3BBFF" />
                            <stop offset={1} stopColor="#51469A" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </span>
                    <p className="text font-label-md text-label-md">{cat.name}</p>
                  </button>
                ))}
              </div>
            </StyledWrapper>
          </div>

          {/* Right Hero 3D Orb Scene */}
          <div className="lg:col-span-5 w-full flex items-center justify-center min-h-[340px]">
            <CampusLoopOrb />
          </div>
        </div>
      </motion.section>

      {/* Live Campus Section */}
      <LiveCampusSection />

      {/* Recently Added Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full py-lg bg-surface-container-low/30 dark:bg-slate-900/30 overflow-hidden transition-all duration-700 ease-out border-y border-outline-variant/10"
      >
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
      </motion.section>

      {/* For You Personalization Section */}
      <ForYouSection recentListings={recentListings} />

      {/* Bento Grid: Trending & Recommended */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full py-xl max-w-container-max mx-auto px-margin-mobile md:px-lg transition-all duration-700 ease-out"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Trending Items (Large Bento Card) */}
          <div className="md:col-span-8 bg-surface-container dark:bg-slate-900/60 rounded-[32px] p-lg relative overflow-hidden group border border-outline-variant/15">
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
                <div
                  onClick={() => navigate('/marketplace?search=Sony')}
                  className="bg-surface-container-lowest dark:bg-slate-800 p-sm rounded-2xl flex items-center gap-sm hover:shadow-md transition-shadow cursor-pointer border border-outline-variant/10"
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

                <div
                  onClick={() => navigate('/marketplace?search=Nespresso')}
                  className="bg-surface-container-lowest dark:bg-slate-800 p-sm rounded-2xl flex items-center gap-sm hover:shadow-md transition-shadow cursor-pointer border border-outline-variant/10"
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
      </motion.section>

      {/* Scroll Story Section */}
      <ScrollStorySection />

      {/* Trust Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full py-xl bg-surface-container-lowest dark:bg-slate-900/60 transition-all duration-700 ease-out border-y border-outline-variant/10"
      >
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg flex flex-col md:flex-row items-center gap-xl">
          <div className="md:w-1/2 relative w-full">
            <div className="w-full aspect-square max-w-md mx-auto bg-surface-container dark:bg-slate-800 rounded-[40px] flex items-center justify-center p-xl relative overflow-hidden">
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
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full py-xl px-margin-mobile md:px-lg transition-all duration-700 ease-out"
      >
        <div className="max-w-container-max mx-auto bg-inverse-surface text-inverse-on-surface rounded-[40px] p-lg md:p-xl flex flex-col items-center text-center">
          <h2 className="font-display-lg text-[40px] md:text-display-lg mb-sm">Ready to declutter your dorm?</h2>
          <p className="font-body-lg text-body-lg opacity-80 mb-lg max-w-2xl">
            List your first item in less than 2 minutes. Free for all students.
          </p>
          <StyledWrapper className="flex flex-col sm:flex-row gap-sm">
            <button
              onClick={() => navigate('/sell')}
              className="cta-button shrink-0"
            >
              <span className="button_top">List an Item</span>
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="cta-button shrink-0"
            >
              <span className="button_top">Learn More</span>
            </button>
          </StyledWrapper>
        </div>
      </motion.section>
    </main>
  );
};

const StyledWrapper = styled.div`
  .button {
    position: relative;
    transition: all 0.3s ease-in-out;
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
    padding-block: 0.5rem;
    padding-inline: 1.25rem;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: bold;
    border: 3px solid #ffffff4d;
    outline: none;
    overflow: hidden;
    font-size: 15px;
    cursor: pointer;
  }

  .icon {
    width: 24px;
    height: 24px;
    transition: all 0.3s ease-in-out;
  }

  .button:hover {
    transform: scale(1.05);
    border-color: #fff9;
  }

  .button:hover .icon {
    transform: translate(4px);
  }

  .button:hover::before {
    animation: shine 1.5s ease-out infinite;
  }

  .button::before {
    content: "";
    position: absolute;
    width: 100px;
    height: 100%;
    background-image: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0) 70%
    );
    top: 0;
    left: -100px;
    opacity: 0.6;
  }

  @keyframes shine {
    0% {
      left: -100px;
    }

    60% {
      left: 100%;
    }

    to {
      left: 100%;
    }
  }

  .category-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: fit-content;
    height: 45px;
    border: none;
    padding: 0px 16px 0px 12px;
    border-radius: 9999px;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s;
  }
  .folderContainer {
    width: 24px;
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    position: relative;
  }
  .fileBack {
    z-index: 1;
    width: 100%;
    height: auto;
  }
  .filePage {
    width: 50%;
    height: auto;
    position: absolute;
    z-index: 2;
    transition: all 0.3s ease-out;
  }
  .fileFront {
    width: 100%;
    height: auto;
    position: absolute;
    z-index: 3;
    opacity: 0.95;
    transform-origin: bottom;
    transition: all 0.3s ease-out;
  }
  .text {
    letter-spacing: 0.5px;
  }
  .category-btn:hover .filePage {
    transform: translateY(-8px);
  }
  .category-btn:active {
    transform: scale(0.95);
  }
  .category-btn:hover .fileFront {
    transform: rotateX(30deg);
  }

  .cta-button {
    --button_radius: 0.75em;
    --button_color: #e8e8e8;
    --button_outline_color: #000000;
    font-size: 17px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    border-radius: var(--button_radius);
    background: var(--button_outline_color);
    padding: 0;
  }

  .cta-button .button_top {
    display: block;
    box-sizing: border-box;
    border: 2px solid var(--button_outline_color);
    border-radius: var(--button_radius);
    padding: 0.75em 1.5em;
    background: var(--button_color);
    color: var(--button_outline_color);
    transform: translateY(-0.2em);
    transition: transform 0.1s ease;
  }

  .cta-button:hover .button_top {
    transform: translateY(-0.33em);
  }

  .cta-button:active .button_top {
    transform: translateY(0);
  }
`;

export default Home;