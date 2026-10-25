const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, uploadAvatar, addReview } = require('../controllers/userController');
const { blockUser, unblockUser, getBlockedUsers } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Specific / non-parameterized routes (MUST be before /:id)
router.get('/blocked', protect, getBlockedUsers);
router.post('/blocked', protect, getBlockedUsers);
router.put('/profile', protect, updateUserProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Parameterized routes
router.get('/:id', getUserProfile);
router.post('/:id/rate', protect, addReview);
router.post('/:id/block', protect, blockUser);
router.post('/:id/unblock', protect, unblockUser);

module.exports = router;
