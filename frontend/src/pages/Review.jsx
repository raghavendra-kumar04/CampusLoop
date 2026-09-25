import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Review = () => {
  const { sellerId } = useParams();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get('listingId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchDetails = async () => {
      try {
        // Fetch listing
        if (listingId) {
          const lRes = await axios.get(`/api/listings/${listingId}`);
          setListing(lRes.data);
        }
        // Fetch seller details
        const sRes = await axios.get(`/api/users/${sellerId}`);
        setSeller(sRes.data.user || sRes.data);
      } catch (err) {
        console.error('Error fetching transaction info:', err);
        setErrorMsg('Failed to locate transaction or seller information.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [sellerId, listingId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('Please specify a rating between 1 and 5 stars.');
      return;
    }
    if (!reviewText.trim()) {
      setErrorMsg('Please write a brief review about your experience.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await axios.post('/api/reviews', {
        sellerId,
        rating,
        reviewText: reviewText.trim(),
        listingId
      });
      toast.success('Thank you! Your feedback has been submitted.');
      navigate(`/profile/${sellerId}`);
    } catch (err) {
      console.error('Error submitting review:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit review. You might have already rated this item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center bg-background">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">sync</span>
        <span className="text-body-md text-outline mt-sm font-sans">Connecting details...</span>
      </div>
    );
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl">
      <div className="max-w-md mx-auto bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-md flex flex-col gap-6 select-none font-sans">
        
        {/* Banner/Header */}
        <div className="text-center pb-4 border-b border-outline-variant/10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Rate Transaction</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Let the campus know about your purchase experience.
          </p>
        </div>

        {errorMsg && (
          <div className="p-sm bg-error-container/10 border border-error/20 text-error rounded-xl font-label-md text-label-md text-center">
            {errorMsg}
          </div>
        )}

        {/* Listing Context Info */}
        {listing && (
          <div className="p-sm rounded-xl bg-surface-container flex items-center gap-sm border border-outline-variant/10">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-outline-variant/20 shrink-0 bg-surface-container-low">
              {listing.images && listing.images[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-outline">image</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md text-on-surface truncate pr-2">
                {listing.title}
              </p>
              <p className="font-label-md text-label-md text-[#10B981] mt-0.5 font-bold">
                {listing.listingType === 'Donate' ? 'Free' : `₹${listing.price}`}
              </p>
              <p className="text-caption text-outline font-caption mt-0.5 truncate text-[11px]">
                Sold by {seller?.name || seller?.user?.name || listing?.seller?.name || 'Seller'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-2">
            <label className="font-label-md text-label-md text-outline uppercase tracking-wider">
              Overall Rating
            </label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((starNum) => (
                <button
                  type="button"
                  key={starNum}
                  onClick={() => setRating(starNum)}
                  onMouseEnter={() => setHoverRating(starNum)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 active:scale-95 transition-all text-[40px] focus:outline-none"
                >
                  <span
                    className={`material-symbols-outlined transition-colors duration-150 ${
                      (hoverRating || rating) >= starNum ? 'text-amber-400 fill-icon' : 'text-outline-variant/60'
                    }`}
                    style={{ fontSize: '40px' }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <span className="font-label-md text-label-md text-primary mt-0.5">
              {rating === 5 && 'Excellent'}
              {rating === 4 && 'Good'}
              {rating === 3 && 'Average'}
              {rating === 2 && 'Below Average'}
              {rating === 1 && 'Poor'}
            </span>
          </div>

          {/* Comment description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reviewText" className="font-label-md text-label-md text-outline uppercase tracking-wider">
              Write a Review
            </label>
            <textarea
              id="reviewText"
              rows="4"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was the communication? Was the item as described? Smooth transaction?"
              maxLength="500"
              className="w-full p-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-primary text-body-md font-body-md text-on-surface outline-none placeholder:text-on-surface-variant/40 resize-none transition-all"
            ></textarea>
            <span className="text-right text-caption text-outline font-caption text-[11px] mt-0.5">
              {reviewText.length}/500 chars
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-sm pt-2">
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="flex-1 py-3 rounded-xl border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reviewText.trim()}
              className="flex-1 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>

      </div>
    </main>
  );
};

export default Review;
