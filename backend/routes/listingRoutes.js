const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  toggleSaveListing,
  getSavedListings,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { listingLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../config/cloudinary');

// Listings queries (Public)
router.get('/', getListings);
router.get('/:id', getListingById);

// Saved items (Protected)
router.get('/saved/wishlist', protect, getSavedListings);
router.post('/:id/save', protect, toggleSaveListing);

// Listings CRUD (Protected & rate-limited)
router.post('/', protect, listingLimiter, upload.array('images', 5), createListing);
router.put('/:id', protect, upload.array('images', 5), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
