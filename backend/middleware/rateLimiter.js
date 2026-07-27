const rateLimit = require('express-rate-limit');

// Anti-spam rules for registering/logging in
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: {
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Anti-spam rules for creating items
const listingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 listing creations per hour
  message: {
    message: 'Anti-spam protection triggered: You have exceeded the listing limit of 10 items per hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Anti-spam rules for sending chat messages
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 chat messages per minute
  message: {
    message: 'You are sending messages too fast. Slow down!'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  listingLimiter,
  messageLimiter
};
