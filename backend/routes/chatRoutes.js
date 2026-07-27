const express = require('express');
const router = express.Router();
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../config/cloudinary');

// Protected Chat endpoints
router.get('/', protect, getConversations);
router.post('/start', protect, startConversation);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, messageLimiter, upload.single('image'), sendMessage);

module.exports = router;
