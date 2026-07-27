import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ListingCard = ({ listing, onWishlistToggle, onDelete, widthClass = '' }) => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && listing) {
      setIsSaved(user.savedItems?.includes(listing._id) || false);
    }
  }, [user, listing]);

  const handleCardClick = () => {
    navigate(`/item/${listing._id}`);
  };

  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.post(`/api/listings/${listing._id}/save`);
      
      let updatedSaved;
      if (res.data.saved) {
        updatedSaved = [...(user.savedItems || []), listing._id];
        setIsSaved(true);
      } else {
        updatedSaved = (user.savedItems || []).filter(id => id !== listing._id);
        setIsSaved(false);
      }

      const updatedUser = { ...user, savedItems: updatedSaved };
      setUser(updatedUser);

      if (onWishlistToggle) {
        onWishlistToggle(listing._id, res.data.saved);
      }
    } catch (err) {
      console.error('Error saving listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setLoading(true);
      try {
        await axios.delete(`/api/listings/${listing._id}`);
        if (onDelete) {
          onDelete(listing._id);
        } else {
          navigate('/marketplace');
        }
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert(err.response?.data?.message || 'Failed to delete listing.');
      } finally {
        setLoading(false);
      }
    }
  };

  const firstImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

  const isOwner = user && listing.seller && (user._id === (listing.seller._id || listing.seller));

  return (
    <div
      onClick={handleCardClick}
      className={`marketplace-card bg-surface-container-lowest rounded-2xl p-base hover-lift cursor-pointer shadow-sm select-none ${widthClass}`}
    >
      {/* Cover Image aspect-[4/3] */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-sm bg-surface-container">
        <img
          src={firstImage}
          alt={listing.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Wishlist Heart Overlay */}
        {!isOwner && (
          <button
            onClick={handleSaveToggle}
            disabled={loading}
            className="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-md p-1.5 rounded-full shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 text-primary"
          >
            <span
              className="material-symbols-outlined text-[20px] text-primary"
              style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        )}

        {/* Delete Button Overlay for Owner */}
        {isOwner && (
          <button
            onClick={handleDeleteClick}
            disabled={loading}
            className="absolute top-2 right-2 bg-error/10 hover:bg-error/20 backdrop-blur-md p-1.5 rounded-full shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 text-error"
          >
            <span className="material-symbols-outlined text-[20px]">
              delete
            </span>
          </button>
        )}
      </div>

      {/* Card Info Details */}
      <div className="px-sm pb-sm">
        <div className="flex justify-between items-start mb-xs gap-xs">
          <h3 className="font-headline-md text-[18px] text-on-surface leading-tight truncate flex-1">
            {listing.title}
          </h3>
          <span className="text-tertiary font-bold text-headline-md whitespace-nowrap">
            {listing.listingType === 'Donate' ? 'Free' : `₹${listing.price}`}
          </span>
        </div>

        {/* Meetup location */}
        <div className="flex items-center gap-xs text-outline text-caption font-caption mb-sm">
          <span className="material-symbols-outlined text-[16px] text-outline">location_on</span>
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Seller Info & Condition tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-xs min-w-0">
            <div className="w-6 h-6 rounded-full bg-primary-container/20 overflow-hidden flex items-center justify-center shrink-0">
              {listing.seller?.avatar ? (
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[14px] text-primary">person</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-caption font-caption text-on-surface-variant truncate font-semibold leading-tight">
                {listing.seller?.name || 'Student'}
              </span>
              {listing.seller?.ratingsCount > 0 ? (
                <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold mt-0.5 leading-none">
                  <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span>{Number(listing.seller.rating).toFixed(1)}</span>
                  <span className="text-outline font-normal">({listing.seller.ratingsCount})</span>
                </div>
              ) : (
                <span className="text-[9px] text-outline mt-0.5 leading-none">No reviews</span>
              )}
            </div>
          </div>

          <span className="bg-tertiary-container/10 text-tertiary font-label-md text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            {listing.condition}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
