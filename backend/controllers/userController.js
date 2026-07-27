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

    // Get listings posted by this user
    const listings = await Listing.find({ seller: req.params.id }).sort({ createdAt: -1 });

    // Get reviews received by this user
    const reviews = await Review.find({ seller: req.params.id })
      .populate('buyer', 'name avatar major')
      .sort({ createdAt: -1 });

    res.json({
      user,
      listings,
      reviews,
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
    const { rating, review } = req.body;
    const sellerId = req.params.id;
    const buyerId = req.user.id;

    if (!rating || !review) {
      return res.status(400).json({ message: 'Please provide both rating (1-5) and review text' });
    }

    if (sellerId === buyerId.toString()) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    // Check if buyer has already reviewed this seller
    const alreadyReviewed = await Review.findOne({ seller: sellerId, buyer: buyerId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this student' });
    }

    const reviewDoc = await Review.create({
      seller: sellerId,
      buyer: buyerId,
      rating,
      review,
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
