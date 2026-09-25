const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const { productAIChat } = require('../controllers/aiController');

// Per-user AI rate limiter: 20 AI queries per user per hour
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip, // limit by user ID, not just IP
  message: { message: 'AI query limit reached. You can ask 20 questions per hour. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/ai/product-chat
// User must be logged in; product data is fetched server-side from DB
router.post('/product-chat', protect, aiLimiter, productAIChat);

module.exports = router;
