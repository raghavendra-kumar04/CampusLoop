const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all listings with filters and sorting
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      condition, 
      listingType, 
      status, 
      seller,
      sortBy 
    } = req.query;

    const query = {};

    // 1. Keyword search (on indexed title and description)
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Category filter (can handle single value or array)
    if (category) {
      if (Array.isArray(category)) {
        query.category = { $in: category };
      } else {
        query.category = category;
      }
    }

    // 3. Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    // 4. Condition filter (can handle single value or array)
    if (condition) {
      if (Array.isArray(condition)) {
        query.condition = { $in: condition };
      } else {
        query.condition = condition;
      }
    }

    // 5. Listing Type (Sell, Exchange, Donate)
    if (listingType) {
      query.listingType = listingType;
    }

    // 6. Status filter (Default to Available if not explicitly searching for sold items)
    if (status) {
      query.status = status;
    } else {
      query.status = 'Available'; // Only show available listings by default
    }

    // 7. Seller filter (To get student's own items)
    if (seller) {
      query.seller = seller;
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // Default: newest first
    if (sortBy === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    // Perform query and populate seller information
    const listings = await Listing.find(query)
      .populate('seller', 'name avatar rating ratingsCount isVerified major')
      .sort(sortOptions);

    res.json(listings);
  } catch (error) {
    console.error('GetListings Error:', error);
    res.status(500).json({ message: 'Server error retrieving listings' });
  }
};

// @desc    Get a single listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name avatar rating ratingsCount isVerified major graduationYear bio createdAt');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('GetListingById Error:', error);
    res.status(500).json({ message: 'Server error retrieving listing details' });
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private
const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, listingType, location } = req.body;

    if (!title || !description || price === undefined || !category || !condition || !location) {
      return res.status(400).json({ message: 'Please add all required listing fields' });
    }

    // Handle files upload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one image' });
    }

    const images = req.files.map(file => {
      // Cloudinary returns path, local fallback returns filename/url
      if (file.path) return file.path;
      return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    });

    const listing = await Listing.create({
      title,
      description,
      price: Number(price),
      category,
      condition,
      listingType: listingType || 'Sell',
      images,
      location,
      seller: req.user.id,
    });

    const populatedListing = await Listing.findById(listing._id).populate('seller', 'name avatar');

    // Notify all other users about this new item
    try {
      const users = await User.find({ _id: { $ne: req.user.id } });
      const notifications = users.map(u => ({
        recipient: u._id,
        sender: req.user.id,
        type: 'listing',
        title: 'New Listing Available',
        message: `${populatedListing.seller.name} uploaded a new item: "${title}"`,
        link: `/item/${listing._id}`,
      }));

      if (notifications.length > 0) {
        const createdNotifications = await Notification.insertMany(notifications);
        const io = req.app.get('socketio');
        if (io) {
          createdNotifications.forEach((notif) => {
            const populatedNotif = {
              ...notif.toObject(),
              sender: {
                _id: req.user.id,
                name: populatedListing.seller.name,
                avatar: populatedListing.seller.avatar
              }
            };
            io.to(notif.recipient.toString()).emit('new_notification', populatedNotif);
          });
        }
      }
    } catch (notifErr) {
      console.error('Failed to dispatch new listing notifications:', notifErr);
    }

    res.status(201).json(populatedListing);
  } catch (error) {
    console.error('CreateListing Error:', error);
    res.status(500).json({ message: error.message || 'Server error creating listing' });
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Verify ownership
    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized. You can only edit your own listings.' });
    }

    // Update text fields
    listing.title = req.body.title || listing.title;
    listing.description = req.body.description || listing.description;
    listing.price = req.body.price !== undefined ? Number(req.body.price) : listing.price;
    listing.category = req.body.category || listing.category;
    listing.condition = req.body.condition || listing.condition;
    listing.listingType = req.body.listingType || listing.listingType;
    listing.location = req.body.location || listing.location;
    listing.status = req.body.status || listing.status;

    // Handle existing images
    let existingImages = [];
    if (req.body.existingImages) {
      try {
        existingImages = typeof req.body.existingImages === 'string'
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (e) {
        existingImages = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
      }
    } else {
      existingImages = listing.images;
    }

    // Handle optional additional image uploads if submitted
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        if (file.path) return file.path;
        return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      });
      listing.images = [...existingImages, ...newImages];
    } else {
      listing.images = existingImages;
    }

    const updatedListing = await listing.save();
    const populated = await Listing.findById(updatedListing._id).populate('seller', 'name avatar');
    res.json(populated);
  } catch (error) {
    console.error('UpdateListing Error:', error);
    res.status(500).json({ message: 'Server error updating listing' });
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Verify ownership
    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized. You can only delete your own listings.' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing successfully deleted' });
  } catch (error) {
    console.error('DeleteListing Error:', error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
};

// @desc    Toggle save listing in wishlist
// @route   POST /api/listings/:id/save
// @access  Private
const toggleSaveListing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot save your own listing' });
    }

    const isSaved = user.savedItems.includes(listingId);

    if (isSaved) {
      // Remove from saved
      user.savedItems = user.savedItems.filter(id => id.toString() !== listingId);
    } else {
      // Add to saved
      user.savedItems.push(listingId);
    }

    await user.save();

    // Create a notification for the seller if they saved the listing
    if (!isSaved) {
      try {
        const notification = await Notification.create({
          recipient: listing.seller,
          sender: req.user.id,
          type: 'save',
          title: 'Item Saved',
          message: `${user.name} saved your item: "${listing.title}"`,
          link: `/item/${listing._id}`,
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate('sender', 'name avatar');

        const io = req.app.get('socketio');
        if (io) {
          io.to(listing.seller.toString()).emit('new_notification', populatedNotification);
        }
      } catch (notifErr) {
        console.error('Failed to create save notification:', notifErr);
      }
    }

    res.json({ 
      saved: !isSaved, 
      message: isSaved ? 'Removed from saved items' : 'Saved to wishlist successfully' 
    });
  } catch (error) {
    console.error('ToggleSaveListing Error:', error);
    res.status(500).json({ message: 'Server error toggling save listing' });
  }
};

// @desc    Get user's saved wishlist items
// @route   GET /api/listings/saved
// @access  Private
const getSavedListings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedItems',
      populate: {
        path: 'seller',
        select: 'name avatar rating ratingsCount isVerified major'
      }
    });

    res.json(user.savedItems);
  } catch (error) {
    console.error('GetSavedListings Error:', error);
    res.status(500).json({ message: 'Server error retrieving saved items' });
  }
};

// @desc    Get potential buyers (users who have chatted with the seller about this listing)
// @route   GET /api/listings/:id/potential-buyers
// @access  Private
const getPotentialBuyers = async (req, res) => {
  try {
    const listingId = req.params.id;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized. You are not the seller of this listing.' });
    }

    const Conversation = require('../models/Conversation');
    const conversations = await Conversation.find({ listing: listingId })
      .populate('participants', 'name avatar');

    const potentialBuyers = [];
    const seen = new Set();

    conversations.forEach(conv => {
      conv.participants.forEach(p => {
        if (p._id.toString() !== req.user.id && !seen.has(p._id.toString())) {
          seen.add(p._id.toString());
          potentialBuyers.push({
            _id: p._id,
            name: p.name,
            avatar: p.avatar
          });
        }
      });
    });

    res.json(potentialBuyers);
  } catch (error) {
    console.error('GetPotentialBuyers Error:', error);
    res.status(500).json({ message: 'Server error retrieving potential buyers' });
  }
};

// @desc    Mark a listing as sold and register its buyer
// @route   PUT /api/listings/:id/sold
// @access  Private
const markAsSold = async (req, res) => {
  try {
    const { buyerId } = req.body;
    const listingId = req.params.id;

    if (!buyerId) {
      return res.status(400).json({ message: 'Please specify the buyer.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized. You can only mark your own items as sold.' });
    }

    listing.status = 'Sold';
    listing.buyer = buyerId;
    await listing.save();

    // Create notification for the buyer
    try {
      const notification = await Notification.create({
        recipient: buyerId,
        sender: req.user.id,
        type: 'purchase',
        title: 'Purchase Completed',
        message: `Your purchase of "${listing.title}" has been marked as completed. Please rate your experience with the seller.`,
        link: `/review/${req.user.id}?listingId=${listing._id}`,
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate('sender', 'name avatar');

      const io = req.app.get('socketio');
      if (io) {
        io.to(buyerId.toString()).emit('new_notification', populatedNotification);
      }
    } catch (notifErr) {
      console.error('Failed to create purchase completion notification:', notifErr);
    }

    res.json(listing);
  } catch (error) {
    console.error('MarkAsSold Error:', error);
    res.status(500).json({ message: 'Server error marking listing as sold' });
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleSaveListing,
  getSavedListings,
  getPotentialBuyers,
  markAsSold,
};
