import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { isProfileComplete } from '../utils/profile';
import ListingCard from '../components/ListingCard';
import './ItemDetails.css';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [chatStarting, setChatStarting] = useState(false);

  // AI Chat states
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Sold & Rating Workflow States
  const [potentialBuyers, setPotentialBuyers] = useState([]);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [submittingSold, setSubmittingSold] = useState(false);

  const fetchPotentialBuyers = async () => {
    setShowSoldModal(true);
    setBuyersLoading(true);
    try {
      const res = await axios.get(`/api/listings/${id}/potential-buyers`);
      setPotentialBuyers(res.data);
      if (res.data.length > 0) {
        setSelectedBuyerId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching potential buyers:', err);
    } finally {
      setBuyersLoading(false);
    }
  };

  const handleMarkAsSoldConfirm = async () => {
    if (!selectedBuyerId) {
      toast.error('Please select a buyer.');
      return;
    }
    setSubmittingSold(true);
    try {
      await axios.put(`/api/listings/${id}/sold`, { buyerId: selectedBuyerId });
      setListing(prev => ({ ...prev, status: 'Sold', buyer: selectedBuyerId }));
      setShowSoldModal(false);
      toast.success('Listing marked as sold!');
    } catch (err) {
      console.error('Error marking listing as sold:', err);
      toast.error(err.response?.data?.message || 'Failed to mark as sold.');
    } finally {
      setSubmittingSold(false);
    }
  };

  // AI Chat handler — sends message + listingId to backend; product context loaded server-side
  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setAiLoading(true);

    try {
      const res = await axios.post('/api/ai/product-chat', {
        listingId: listing._id,
        message: userMessage,
      });
      setAiMessages(prev => [...prev, { role: 'ai', text: res.data.message }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'AI unavailable. Try again.';
      setAiMessages(prev => [...prev, { role: 'ai', text: errMsg, isError: true }]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/listings/${id}`);
        setListing(res.data);
        setIsSaved(user?.savedItems?.includes(res.data._id) || false);
        
        const similarRes = await axios.get(`/api/listings?category=${encodeURIComponent(res.data.category)}`);
        setSimilarListings(similarRes.data.filter(item => item._id !== res.data._id).slice(0, 4));
      } catch (err) {
        console.error('Error fetching listing details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchListingData();
    setActiveImageIndex(0);
  }, [id, user]);

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await axios.post(`/api/listings/${listing._id}/save`);
      
      let updatedSaved;
      if (res.data.saved) {
        updatedSaved = [...(user.savedItems || []), listing._id];
        setIsSaved(true);
      } else {
        updatedSaved = (user.savedItems || []).filter(item => item !== listing._id);
        setIsSaved(false);
      }

      setUser({ ...user, savedItems: updatedSaved });
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isProfileComplete(user)) {
      toast.error('Please complete your profile details (Major, Graduation Year, and Bio) before contacting sellers or buying items.');
      navigate(`/profile/${user._id}?edit=true`);
      return;
    }
    setChatStarting(true);
    try {
      const res = await axios.post('/api/chats/start', {
        listingId: listing._id,
        receiverId: listing.seller._id
      });
      navigate('/messages', { state: { activeConversationId: res.data._id } });
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.error(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setChatStarting(false);
    }
  };

  const handleDeleteListing = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`/api/listings/${id}`);
        toast.success('Listing deleted successfully');
        navigate(`/profile/${user._id}`);
      } catch (err) {
        console.error('Error deleting listing:', err);
        toast.error(err.response?.data?.message || 'Failed to delete listing.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-lg py-xl flex flex-col gap-md">
        <div className="h-6 w-48 bg-surface-container skeleton rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-7 aspect-[4/3] bg-surface-container skeleton rounded-2xl"></div>
          <div className="lg:col-span-5 space-y-md">
            <div className="h-10 w-3/4 bg-surface-container skeleton rounded"></div>
            <div className="h-8 w-1/4 bg-surface-container skeleton rounded"></div>
            <div className="h-24 w-full bg-surface-container skeleton rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-container-max mx-auto px-margin-mobile py-xl text-center space-y-sm">
        <span className="material-symbols-outlined text-[64px] text-outline">error</span>
        <h2 className="font-extrabold text-lg text-on-surface">Listing Not Found</h2>
        <p className="text-xs text-on-surface-variant">The listing you are looking for is not active.</p>
        <Link to="/marketplace" className="text-primary font-bold text-xs hover:underline block pt-sm">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && user._id === listing.seller?._id;

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-lg pt-sm md:pt-lg pb-xl">
      
      {listing.status === 'Sold' && (
        <div className="mb-sm bg-error-container/10 border border-error/20 text-error rounded-2xl p-sm flex items-center gap-sm shadow-sm select-none">
          <span className="material-symbols-outlined text-[24px]">check_circle</span>
          <span className="font-label-md text-label-md">
            This item has been sold. Transaction completed.
          </span>
        </div>
      )}
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-xs mb-md text-on-surface-variant">
        <span onClick={() => navigate('/marketplace')} className="font-label-md text-label-md cursor-pointer hover:text-primary transition-colors">
          Marketplace
        </span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span onClick={() => navigate(`/marketplace?category=${listing.category}`)} className="font-label-md text-label-md cursor-pointer hover:text-primary transition-colors">
          {listing.category}
        </span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="font-label-md text-label-md text-outline truncate max-w-[150px] md:max-w-none">
          {listing.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg lg:items-start">
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-sm">
          
          <div className="relative group aspect-square lg:aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm bg-surface-container border border-outline-variant/10">
            <img
              src={listing.images[activeImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {listing.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === 0 ? listing.images.length - 1 : prev - 1))}
                  className="w-10 h-10 rounded-full bg-surface/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => (prev === listing.images.length - 1 ? 0 : prev + 1))}
                  className="w-10 h-10 rounded-full bg-surface/90 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {listing.images.length > 1 && (
            <div className="flex gap-sm overflow-x-auto scrollbar-hide pb-xs">
              {listing.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 cursor-pointer shadow-sm ${
                    index === activeImageIndex ? 'border-primary' : 'border-outline-variant hover:border-primary transition-all'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Seller */}
        <div className="lg:col-span-5 flex flex-col gap-md lg:sticky lg:top-24">
          
          {/* Product Information */}
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-start gap-xs">
              <h1 className="font-headline-lg text-headline-lg text-on-surface leading-tight flex-1">
                {listing.title}
              </h1>
              {!isOwner && (
                <button
                  onClick={handleSaveToggle}
                  disabled={wishlistLoading}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors flex-shrink-0"
                >
                  <span className={`material-symbols-outlined text-[24px] ${isSaved ? 'text-error fill-icon' : ''}`}>
                    favorite
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-baseline gap-sm">
              <span className="font-headline-lg text-headline-lg text-[#10B981] select-none">
                {listing.listingType === 'Donate' ? 'Free' : `₹${listing.price}`}
              </span>
              
              {listing.listingType === 'Sell' && listing.price > 0 && (
                <span className="font-label-md text-label-md text-on-surface-variant line-through opacity-60">
                  ₹{Math.round(listing.price * 1.5)} Est. Retail
                </span>
              )}
            </div>

            {/* Parameter badges */}
            <div className="flex flex-wrap gap-xs">
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md">
                {listing.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-label-md uppercase">
                {listing.condition}
              </span>
              {listing.seller?.isVerified && (
                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-md text-label-md">
                  Verified Listing
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-xs">
            <h3 className="font-label-md text-label-md text-outline uppercase tracking-wider">Description</h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {listing.description}
            </p>
          </div>

          <div className="h-px bg-outline-variant/30 w-full"></div>

          {/* Seller Profile Card */}
          <Link
            to={`/profile/${listing.seller._id}`}
            className="bg-surface-container-lowest p-sm rounded-2xl border border-outline-variant/20 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-sm">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface-container-high shrink-0">
                {listing.seller.avatar ? (
                  <img src={listing.seller.avatar} alt="seller avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {listing.seller.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-xs">
                  <span className="font-headline-md text-label-md text-on-surface">
                    {listing.seller.name}
                  </span>
                  {listing.seller.isVerified && (
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  )}
                </div>
                <span className="font-caption text-caption text-on-surface-variant">
                  {listing.seller.major ? `${listing.seller.major} Major` : 'Student'}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="font-label-md text-label-md text-on-surface">
                    {listing.seller.rating || '0.0'}
                  </span>
                  <span className="font-caption text-caption text-outline">
                    ({listing.seller.ratingsCount || '0'} reviews)
                  </span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all">
              chevron_right
            </span>
          </Link>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex flex-col gap-sm">
            {!isOwner ? (
              <button
                onClick={handleStartChat}
                disabled={chatStarting || listing.status !== 'Available'}
                className="primary-gradient w-full py-4 rounded-xl text-on-primary font-label-md text-label-md flex items-center justify-center gap-sm shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined">chat</span>
                {listing.status === 'Sold' ? 'Sold Out' : (chatStarting ? 'Opening Chat...' : 'Chat with Seller')}
              </button>
            ) : (
              <div className="flex flex-col gap-sm">
                {listing.status === 'Available' ? (
                  <>
                    <button
                      onClick={fetchPotentialBuyers}
                      className="bg-emerald-600 hover:bg-emerald-700 w-full py-4 rounded-xl text-white font-label-md text-label-md flex items-center justify-center gap-sm shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Mark as Sold
                    </button>
                    <button
                      onClick={() => navigate('/sell', { state: { editListingId: listing._id } })}
                      className="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 w-full py-4 rounded-xl text-on-surface font-label-md text-label-md flex items-center justify-center gap-sm transition-all"
                    >
                      <span className="material-symbols-outlined">edit</span>
                      Edit Listing
                    </button>
                  </>
                ) : (
                  <div className="bg-surface-container-low border border-outline-variant/20 p-4 rounded-xl text-center text-on-surface-variant font-label-md text-label-md flex items-center justify-center gap-sm">
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                    Item Sold Completed
                  </div>
                )}
                <button
                  onClick={handleDeleteListing}
                  className="bg-red-50/10 hover:bg-red-50/20 border border-red-500/20 hover:border-red-500/40 text-error w-full py-4 rounded-xl font-label-md text-label-md flex items-center justify-center gap-sm transition-all"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Delete Listing
                </button>
              </div>
            )}

            <div className="flex gap-sm">
              {!isOwner && (
                <button
                  onClick={handleSaveToggle}
                  className="flex-1 py-3 rounded-xl border border-outline text-on-surface font-label-md text-label-md flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                    bookmark
                  </span>
                  {isSaved ? 'Saved' : 'Save'}
                </button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied to clipboard!'))}
                className="flex-1 py-3 rounded-xl border border-outline text-on-surface font-label-md text-label-md flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">share</span>
                Share
              </button>
            </div>

            {/* Ask AI Button */}
            {!isOwner && (
              <button
                onClick={() => {
                  if (!user) { toast.error('Please sign in to use AI chat.'); return; }
                  setAiMessages([{ role: 'ai', text: `Hi! I'm CampusLoop AI. Ask me anything about "${listing.title}" — pricing, condition, what to inspect, or whether it's worth buying!` }]);
                  setAiChatOpen(true);
                }}
                className="w-full py-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-label-md text-label-md flex items-center justify-center gap-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Ask AI about this item
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Similar Campus Items */}
      {similarListings.length > 0 && (
        <section className="mt-xl">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Similar on Campus</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Check out other items nearby in {listing.category}.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {similarListings.map(item => (
              <ListingCard key={item._id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Action Panel */}
      <div className="fixed bottom-0 left-0 w-full z-50 lg:hidden p-margin-mobile bg-surface/90 backdrop-blur-lg border-t border-outline-variant/20 flex items-center gap-sm shadow-lg">
        {!isOwner ? (
          <>
            <button
              onClick={handleSaveToggle}
              className="w-14 h-14 rounded-xl border border-outline flex items-center justify-center text-on-surface shrink-0 bg-surface-container-lowest"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
            </button>
            <button
              onClick={handleStartChat}
              disabled={chatStarting || listing.status !== 'Available'}
              className="primary-gradient flex-1 h-14 rounded-xl text-on-primary font-label-md text-label-md flex items-center justify-center gap-sm active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined">chat</span>
              {listing.status === 'Sold' ? 'Sold Out' : (chatStarting ? 'Opening...' : 'Chat with Seller')}
            </button>
            <button
              onClick={() => {
                if (!user) { toast.error('Please sign in to use AI chat.'); return; }
                setAiMessages([{ role: 'ai', text: `Hi! I'm CampusLoop AI. Ask me anything about "${listing.title}" — pricing, condition, what to inspect, or whether it's worth buying!` }]);
                setAiChatOpen(true);
              }}
              className="w-14 h-14 shrink-0 rounded-xl border border-primary/30 bg-primary/5 text-primary flex items-center justify-center active:scale-95 transition-all"
              title="Ask AI about this item"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col gap-xs">
            <div className="w-full flex gap-sm">
              {listing.status === 'Available' ? (
                <>
                  <button
                    onClick={fetchPotentialBuyers}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 h-14 rounded-xl font-label-md text-label-md flex items-center justify-center gap-xs active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Mark as Sold
                  </button>
                  <button
                    onClick={() => navigate('/sell', { state: { editListingId: listing._id } })}
                    className="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface flex-1 h-14 rounded-xl font-label-md text-label-md flex items-center justify-center gap-xs active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit
                  </button>
                </>
              ) : (
                <div className="w-full bg-surface-container-low border border-outline-variant/20 h-14 rounded-xl flex items-center justify-center gap-sm text-on-surface-variant font-label-md text-label-md">
                  <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                  Listing Sold Out
                </div>
              )}
            </div>
            <button
              onClick={handleDeleteListing}
              className="bg-red-50/10 hover:bg-red-50/20 border border-red-500/20 text-error w-full h-12 rounded-xl font-label-md text-label-md flex items-center justify-center gap-xs active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Delete Listing
            </button>
          </div>
        )}
      </div>

      {/* Mark As Sold Modal */}
      {showSoldModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-sm bg-black/60 backdrop-blur-sm select-none">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30">
            
            {/* Header */}
            <div className="p-md border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-emerald-500">shopping_cart</span>
                Confirm Transaction Sale
              </h3>
              <button 
                onClick={() => setShowSoldModal(false)}
                className="p-1 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant"
              >
                <span className="material-symbols-outlined font-bold">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-md flex flex-col gap-sm">
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Select the user who bought this item. This will log the purchase, remove the listing from search, and prompt them to rate you.
              </p>

              {buyersLoading ? (
                <div className="py-8 flex flex-col items-center gap-xs">
                  <span className="material-symbols-outlined text-[36px] text-primary animate-spin">sync</span>
                  <span className="text-caption text-outline">Loading buyers...</span>
                </div>
              ) : potentialBuyers.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant border border-dashed border-outline-variant rounded-xl flex flex-col items-center gap-xs">
                  <span className="material-symbols-outlined text-[32px] text-outline">chat_bubble</span>
                  <p className="font-label-md text-label-md text-on-surface">No Potential Buyers Found</p>
                  <p className="text-caption text-outline text-[11px] max-w-[280px]">
                    Only users who have opened a chat with you about this item are shown here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-xs max-h-60 overflow-y-auto pr-xs custom-scrollbar">
                  {potentialBuyers.map((buyer) => (
                    <div
                      key={buyer._id}
                      onClick={() => setSelectedBuyerId(buyer._id)}
                      className={`p-sm rounded-xl border flex items-center gap-sm cursor-pointer transition-all ${
                        selectedBuyerId === buyer._id
                          ? 'border-primary bg-primary/5'
                          : 'border-outline-variant/30 hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant shrink-0 bg-surface-container">
                        {buyer.avatar ? (
                          <img src={buyer.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-primary bg-primary/10">
                            {buyer.name?.slice(0,1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-label-md text-label-md text-on-surface flex-1">
                        {buyer.name}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedBuyerId === buyer._id ? 'border-primary' : 'border-outline'
                      }`}>
                        {selectedBuyerId === buyer._id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-md bg-surface-container-low border-t border-outline-variant/20 flex gap-sm justify-end">
              <button
                onClick={() => setShowSoldModal(false)}
                className="py-2.5 px-4 rounded-xl border border-outline text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors animate-press"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsSoldConfirm}
                disabled={submittingSold || potentialBuyers.length === 0 || !selectedBuyerId}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-label-md text-label-md flex items-center gap-xs transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none animate-press"
              >
                {submittingSold ? 'Saving...' : 'Confirm Sale'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* AI Product Chat Modal */}
      {aiChatOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

            {/* Header */}
            <div className="px-6 py-4 bg-primary/5 border-b border-outline-variant/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface">Ask AI about this item</h3>
                  <p className="text-xs text-on-surface-variant truncate max-w-[220px]">{listing.title}</p>
                </div>
              </div>
              <button
                onClick={() => setAiChatOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick suggestion chips */}
            {aiMessages.length <= 1 && (
              <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-b border-outline-variant/10 shrink-0">
                {['Is this price fair?', 'What should I check before buying?', 'Is this a good deal?', 'What does this condition mean?'].map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setAiInput(q);
                      setTimeout(() => document.getElementById('ai-input-field')?.focus(), 50);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : msg.isError
                        ? 'bg-error-container/30 text-error rounded-bl-none'
                        : 'bg-surface-container-high text-on-surface rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-surface-container-high text-on-surface-variant text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleAIChat} className="p-4 border-t border-outline-variant/10 flex items-center gap-2 shrink-0">
              <input
                id="ai-input-field"
                type="text"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder="Ask anything about this item..."
                maxLength={500}
                disabled={aiLoading}
                className="flex-1 bg-surface-container text-on-surface text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || aiLoading}
                className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-40 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
};

export default ItemDetails;
