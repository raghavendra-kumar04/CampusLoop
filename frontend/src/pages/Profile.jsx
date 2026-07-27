import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import ListingCard from '../components/ListingCard';
import Button from '../components/ui/Button';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile, updateAvatar } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [profileListings, setProfileListings] = useState([]);
  const [profileReviews, setProfileReviews] = useState([]);
  const [savedListings, setSavedListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'saved' | 'reviews'
  
  // Edit Profile form
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    major: '',
    graduationYear: ''
  });

  // Submit Review form
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    review: ''
  });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const isOwnProfile = user && user._id === id;

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${id}`);
      setProfileUser(res.data.user);
      setProfileListings(res.data.listings);
      setProfileReviews(res.data.reviews);

      setEditForm({
        name: res.data.user.name,
        bio: res.data.user.bio || '',
        major: res.data.user.major || '',
        graduationYear: res.data.user.graduationYear || ''
      });

      if (user && user._id === id) {
        const savedRes = await axios.get('/api/listings/saved/wishlist');
        setSavedListings(savedRes.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    setActiveTab('listings');
  }, [id, user]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile(editForm);
      setProfileUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    try {
      const newAvatarUrl = await updateAvatar(data);
      setProfileUser(prev => ({ ...prev, avatar: newAvatarUrl }));
    } catch (err) {
      console.error('Avatar upload failed:', err);
    }
  };

  const handleReviewChange = (e) => {
    setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
    setReviewError('');
  };

  const handleReviewSubmit = async (e, listingId) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!reviewForm.review.trim()) {
      setReviewError('Please write review text.');
      return;
    }

    setReviewLoading(true);
    try {
      await axios.post(`/api/users/${id}/rate`, {
        rating: Number(reviewForm.rating),
        review: reviewForm.review.trim(),
        listingId
      });
      setReviewSuccess(true);
      setReviewForm({ rating: 5, review: '', listingId: '' });
      fetchProfileData();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Error submitting review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleWishlistRemove = (listingId) => {
    setSavedListings(prev => prev.filter(item => item._id !== listingId));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-margin-mobile py-xl space-y-md">
        <div className="flex gap-md items-center">
          <div className="w-24 h-24 rounded-full bg-surface-container skeleton"></div>
          <div className="space-y-sm flex-1">
            <div className="h-6 w-1/3 bg-surface-container skeleton"></div>
            <div className="h-4 w-1/2 bg-surface-container skeleton"></div>
          </div>
        </div>
        <div className="h-10 w-full bg-surface-container skeleton rounded"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-margin-mobile py-xl text-center">
        <span className="material-symbols-outlined text-[64px] text-outline">person_off</span>
        <h2 className="font-extrabold text-lg text-on-surface">Student Profile Not Found</h2>
        <button onClick={() => navigate('/')} className="text-primary font-bold text-xs hover:underline mt-sm block mx-auto">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-margin-mobile md:px-lg py-md md:py-lg mb-16 md:mb-0">
      
      {/* Profile Header */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-3xl p-md md:p-lg shadow-sm relative overflow-hidden mb-lg">
        
        {/* Decorations */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-md">
          
          {/* Avatar */}
          <div className="relative shrink-0 select-none">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-sm bg-surface-container">
              {profileUser.avatar ? (
                <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-3xl">
                  {profileUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-on-primary rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-white">
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </label>
            )}
          </div>

          {/* User parameters */}
          <div className="flex-1 text-center sm:text-left space-y-sm min-w-0">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-xs">
                <h1 className="font-headline-lg text-headline-lg text-on-surface truncate">{profileUser.name}</h1>
                {profileUser.isVerified && (
                  <span className="material-symbols-outlined text-primary text-[20px] fill-icon shadow-sm" title="Verified Student">
                    verified
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-xs text-caption font-caption text-outline mt-1 uppercase tracking-wider">
                {profileUser.major && <span>{profileUser.major} Major</span>}
                {profileUser.graduationYear && <span>• Class of {profileUser.graduationYear}</span>}
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-xl">
              {profileUser.bio || 'This student has not set a biography.'}
            </p>

            <div className="flex justify-center sm:justify-start items-center gap-xs pt-1 select-none">
              <RatingStars rating={profileUser.rating} size={14} />
              <span className="font-label-md text-label-md text-on-surface">{profileUser.rating || '0.0'}</span>
              <span className="font-caption text-caption text-outline">({profileUser.ratingsCount} reviews)</span>
            </div>

            {isOwnProfile && !isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="secondary" className="py-2 px-sm text-xs mt-sm">
                Edit Biography
              </Button>
            )}
          </div>

        </div>

        {/* Edit profile form overlay */}
        {isEditing && (
          <form onSubmit={handleEditSubmit} className="mt-lg p-sm bg-surface-container/50 border border-outline-variant/10 rounded-2xl space-y-sm">
            <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider">Update Profile Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase">Display Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full h-9 px-sm bg-surface-container border border-outline-variant/30 rounded-lg text-xs outline-none text-on-surface focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase">Major Study</label>
                <input
                  type="text"
                  name="major"
                  value={editForm.major}
                  onChange={handleEditChange}
                  className="w-full h-9 px-sm bg-surface-container border border-outline-variant/30 rounded-lg text-xs outline-none text-on-surface focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase">Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={editForm.graduationYear}
                  onChange={handleEditChange}
                  className="w-full h-9 px-sm bg-surface-container border border-outline-variant/30 rounded-lg text-xs outline-none text-on-surface focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase">Biography Description</label>
              <textarea
                name="bio"
                rows="3"
                value={editForm.bio}
                onChange={handleEditChange}
                className="w-full p-sm bg-surface-container border border-outline-variant/30 rounded-lg text-xs outline-none resize-none text-on-surface focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-sm">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="py-1 px-3 text-xs">Cancel</Button>
              <Button type="submit" className="py-1.5 px-4 text-xs">Save Settings</Button>
            </div>
          </form>
        )}

      </div>

      {/* Tabs list bar */}
      <div className="flex border-b border-outline-variant/20 mb-md select-none font-semibold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`py-3 px-sm border-b-2 flex items-center gap-xs font-label-md text-label-md transition-colors ${
            activeTab === 'listings' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">storefront</span>
          Listings ({profileListings.length})
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-sm border-b-2 flex items-center gap-xs font-label-md text-label-md transition-colors ${
              activeTab === 'saved' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            Wishlist ({savedListings.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-sm border-b-2 flex items-center gap-xs font-label-md text-label-md transition-colors ${
            activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">rate_review</span>
          Reviews ({profileReviews.length})
        </button>
      </div>

      {/* Panels content */}
      <div>
        
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {profileListings.length === 0 ? (
              <div className="py-xl text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-md">
                No active listings posted yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                {profileListings.map(listing => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'saved' && isOwnProfile && (
          <div>
            {savedListings.length === 0 ? (
              <div className="py-xl text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-md">
                Your saved wishlist items will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                {savedListings.map(listing => (
                  <ListingCard key={listing._id} listing={listing} onWishlistToggle={handleWishlistRemove} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-md">
            
            {/* Reviews display list */}
            {profileReviews.length === 0 ? (
              <div className="py-xl text-center text-xs text-on-surface-variant border border-dashed border-outline-variant/20 bg-surface-container-lowest rounded-3xl p-md">
                No reviews received yet.
              </div>
            ) : (
              <div className="space-y-sm">
                {profileReviews.map((rev) => (
                  <div key={rev._id} className="bg-surface-container-lowest p-sm border border-outline-variant/15 rounded-2xl shadow-sm flex items-start gap-sm">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/10">
                      {rev.buyer?.avatar ? (
                        <img src={rev.buyer.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {rev.buyer?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="font-bold text-xs text-on-surface truncate">{rev.buyer?.name}</h4>
                        <span className="text-[10px] text-outline">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-xs mb-xs select-none">
                        <RatingStars rating={rev.rating} size={10} />
                        <span className="text-[10px] font-bold text-on-surface">{rev.rating}.0</span>
                        {rev.buyer?.major && <span className="text-[10px] text-outline">• {rev.buyer.major}</span>}
                      </div>

                      <p className="text-xs text-on-surface-variant leading-relaxed">{rev.review}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leave Review Form (If not own profile) */}
            {/* Leave Review Form (If not own profile) */}
            {!isOwnProfile && user && (
              (() => {
                const unreviewedPurchases = profileListings.filter(listing => {
                  const listingBuyerId = listing.buyer?._id || listing.buyer;
                  const isBuyer = listingBuyerId && user && listingBuyerId.toString() === user._id.toString();
                  const isSold = listing.status === 'Sold';
                  const isAlreadyReviewed = profileReviews.some(
                    rev => (rev.listing?._id || rev.listing)?.toString() === listing._id.toString()
                  );
                  return isSold && isBuyer && !isAlreadyReviewed;
                });

                if (unreviewedPurchases.length === 0) {
                  return (
                    <div className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-6 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[36px] text-outline mb-xs">info</span>
                      <p className="font-label-md text-label-md text-on-surface">Rate this Seller</p>
                      <p className="text-caption text-outline max-w-[340px] mx-auto mt-xs leading-relaxed">
                        Reviews can only be submitted for items you completed purchase on. Chat with the seller and ask them to mark the item as sold.
                      </p>
                    </div>
                  );
                }

                // If we have unreviewed listings, allow submission
                return (
                  <div className="bg-surface-container-low border border-outline-variant/15 rounded-3xl p-sm md:p-md shadow-sm space-y-sm">
                    <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider">Rate this Seller</h3>
                    
                    {reviewSuccess && (
                      <div className="p-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-bold flex gap-xs items-center leading-snug">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Review submitted successfully! Thank you.</span>
                      </div>
                    )}

                    {reviewError && (
                      <div className="p-sm bg-error-container/20 border border-error-container text-error rounded-xl text-xs flex gap-xs items-center leading-snug">
                        <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                        <span>{reviewError}</span>
                      </div>
                    )}

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      // Auto-select listingId if not manually chosen
                      const selectedLid = reviewForm.listingId || unreviewedPurchases[0]._id;
                      handleReviewSubmit(e, selectedLid);
                    }} className="space-y-sm">
                      
                      {unreviewedPurchases.length > 1 && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Select Purchase Item</label>
                          <select
                            name="listingId"
                            value={reviewForm.listingId || unreviewedPurchases[0]._id}
                            onChange={(e) => setReviewForm({ ...reviewForm, listingId: e.target.value })}
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-2.5 text-xs text-on-surface outline-none focus:ring-1 focus:ring-primary"
                          >
                            {unreviewedPurchases.map(l => (
                              <option key={l._id} value={l._id}>{l.title}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-sm">
                        <span className="text-xs font-bold text-on-surface-variant">Rating Score:</span>
                        <select
                          name="rating"
                          value={reviewForm.rating}
                          onChange={handleReviewChange}
                          className="bg-surface-container-lowest border-none rounded-lg p-1.5 text-xs text-on-surface font-semibold focus:ring-1 focus:ring-primary outline-none"
                        >
                          <option value="5">5 - Excellent (Highly Recommend)</option>
                          <option value="4">4 - Good (Very Satisfied)</option>
                          <option value="3">3 - Average (Satisfactory)</option>
                          <option value="2">2 - Fair (Some Issues)</option>
                          <option value="1">1 - Poor (Not Recommended)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase">Your Review Text</label>
                        <textarea
                          name="review"
                          value={reviewForm.review}
                          onChange={handleReviewChange}
                          rows="3"
                          placeholder="Write details about meetup, pricing, transaction speed..."
                          className="w-full p-sm bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-xs outline-none resize-none text-on-surface focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" disabled={reviewLoading} className="py-2 px-md text-xs">
                          {reviewLoading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </form>
                  </div>
                );
              })()
            )}

          </div>
        )}

      </div>

    </main>
  );
};

export default Profile;
