const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { reportUser, getMyReports } = require('../controllers/reportController');

// Submit a report against a user (optionally for a listing)
router.post('/user/:id', protect, reportUser);

// Get my own filed reports
router.get('/my', protect, getMyReports);

module.exports = router;
