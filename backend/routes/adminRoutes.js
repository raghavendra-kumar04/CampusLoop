const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const {
  getDashboardStats, getAllUsers, getUserDetail, updateUserStatus, deleteUser,
  getAllListings, toggleListingVisibility, deleteListingAdmin,
  getAllReports, resolveReport, getRecentActivity,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, isAdmin);

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Listing management
router.get('/listings', getAllListings);
router.patch('/listings/:id/visibility', toggleListingVisibility);
router.delete('/listings/:id', deleteListingAdmin);

// Reports management
router.get('/reports', getAllReports);
router.patch('/reports/:id', resolveReport);

module.exports = router;
