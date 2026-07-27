const Listing = require('../models/Listing');
const User = require('../models/User');

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

    // Handle optional additional image uploads if submitted
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        if (file.path) return file.path;
        return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      });
      listing.images = [...listing.images, ...newImages];
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

    const isSaved = user.savedItems.includes(listingId);

    if (isSaved) {
      // Remove from saved
      user.savedItems = user.savedItems.filter(id => id.toString() !== listingId);
    } else {
      // Add to saved
      user.savedItems.push(listingId);
    }

    await user.save();
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

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleSaveListing,
  getSavedListings,
};
