const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, uploadAvatar, addReview } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public profile retrieval
router.get('/:id', getUserProfile);

// Protected profile updates
router.put('/profile', protect, updateUserProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Rating / review submission
router.post('/:id/rate', protect, addReview);

module.exports = router;
