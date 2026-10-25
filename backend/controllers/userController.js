const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');

// @desc    Get student profile details with reviews and listings
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check block relationship if authenticated viewer
    const jwt = require('jsonwebtoken');
    let viewerBlockedThisUser = false;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_dev_key_123');
        if (decoded.id !== req.params.id) {
          const viewer = await User.findById(decoded.id).select('blockedUsers');
          if (viewer && viewer.blockedUsers.map(id => id.toString()).includes(req.params.id)) {
            viewerBlockedThisUser = true;
          }
        }
      }
    } catch (e) { /* ignore */ }

    // Get listings posted by this user (excluding hidden ones)
    const listings = viewerBlockedThisUser
      ? []
      : await Listing.find({ seller: req.params.id, isHidden: false }).sort({ createdAt: -1 });

    // Get reviews received by this user
    const reviews = await Review.find({ seller: req.params.id })
      .populate('buyer', 'name avatar major')
      .sort({ createdAt: -1 });

    res.json({
      user,
      listings,
      reviews,
      isBlocked: viewerBlockedThisUser,
    });
  } catch (error) {
    console.error('GetUserProfile Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Update student profile details
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update text fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.major = req.body.major !== undefined ? req.body.major : user.major;
    user.graduationYear = req.body.graduationYear || user.graduationYear;

    // Check if new avatar URL is supplied (e.g. uploaded via separate direct route or client image upload payload)
    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('UpdateUserProfile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Upload avatar image directly
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // Cloudinary returns file.path, local fallback returns file.filename or server relative URL
    let fileUrl = '';
    if (req.file.path) {
      fileUrl = req.file.path; // Cloudinary URL
    } else {
      // Create local fallback link
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const user = await User.findById(req.user.id);
    user.avatar = fileUrl;
    await user.save();

    res.json({ avatar: fileUrl });
  } catch (error) {
    console.error('Avatar Upload Error:', error);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
};

// @desc    Review/Rate another student
// @route   POST /api/users/:id/rate
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, review, listingId } = req.body;
    const sellerId = req.params.id;
    const buyerId = req.user.id;

    if (!rating || !review) {
      return res.status(400).json({ message: 'Please provide both rating (1-5) and review text' });
    }

    if (sellerId === buyerId.toString()) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    // Find if there is a listing sold to this buyer by this seller
    let query = { seller: sellerId, buyer: buyerId, status: 'Sold' };
    if (listingId) {
      query._id = listingId;
    }

    const listing = await Listing.findOne(query);
    if (!listing) {
      return res.status(400).json({ message: 'You can only review sellers after purchasing an item from them.' });
    }

    // Check if buyer has already reviewed this specific listing
    const alreadyReviewed = await Review.findOne({ listing: listing._id });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this transaction' });
    }

    const reviewDoc = await Review.create({
      seller: sellerId,
      buyer: buyerId,
      rating,
      review,
      listing: listing._id,
    });

    res.status(201).json(reviewDoc);
  } catch (error) {
    console.error('AddReview Error:', error);
    res.status(500).json({ message: error.message || 'Server error submitting rating' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  addReview,
};
