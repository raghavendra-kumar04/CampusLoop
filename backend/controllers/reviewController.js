const Review = require('../models/Review');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Submit a review for a seller
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { sellerId, rating, reviewText, listingId } = req.body;

    if (!sellerId || !rating || !reviewText || !listingId) {
      return res.status(400).json({ message: 'Please provide all details: sellerId, listingId, rating, reviewText' });
    }

    // Check if listing exists, is sold, and req.user.id is the buyer
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'Sold') {
      return res.status(400).json({ message: 'You can only review listings that have been sold.' });
    }

    if (listing.buyer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'You are not authorized to rate this transaction. (You must be the buyer)' });
    }

    if (listing.seller.toString() !== sellerId) {
      return res.status(400).json({ message: 'Seller ID mismatch for this listing.' });
    }

    // Creating the Review
    const newReview = await Review.create({
      seller: sellerId,
      buyer: req.user.id,
      rating: Number(rating),
      review: reviewText,
      listing: listingId,
    });

    // Recalculate and update seller's average rating and total ratingsCount
    try {
      const sellerReviews = await Review.find({ seller: sellerId });
      const count = sellerReviews.length;
      const sum = sellerReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;
      await User.findByIdAndUpdate(sellerId, { rating: avg, ratingsCount: count });
    } catch (ratingErr) {
      console.error('Failed to update seller rating summary:', ratingErr);
    }

    // Notify the seller that they were rated!
    try {
      const buyerUser = await User.findById(req.user.id);
      const notification = await Notification.create({
        recipient: sellerId,
        sender: req.user.id,
        type: 'rating',
        title: 'New Rating Received',
        message: `${buyerUser.name} submitted a ${rating}-star review for your transaction on "${listing.title}"`,
        link: `/profile/${sellerId}`,
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name avatar');

      const io = req.app.get('socketio');
      if (io) {
        io.to(sellerId).emit('new_notification', populatedNotification);
      }
    } catch (notifErr) {
      console.error('Failed to create rating notification:', notifErr);
    }

    res.status(201).json(newReview);
  } catch (error) {
    console.error('CreateReview Error:', error);
    // Handle double review unique constraint error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted a review for this transaction.' });
    }
    res.status(500).json({ message: 'Server error saving review' });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/seller/:sellerId
// @access  Public
const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId })
      .populate('buyer', 'name avatar')
      .populate('listing', 'title price images')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('GetSellerReviews Error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

module.exports = {
  createReview,
  getSellerReviews,
};
