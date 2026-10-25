const User = require('../models/User');
const Listing = require('../models/Listing');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers, blockedUsers, totalListings, availableListings,
      soldListings, hiddenListings, pendingReports, totalReports] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', status: 'active' }),
      User.countDocuments({ role: 'user', status: 'blocked' }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'Available', isHidden: false }),
      Listing.countDocuments({ status: 'Sold' }),
      Listing.countDocuments({ isHidden: true }),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments(),
    ]);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsersWeek, newListingsWeek] = await Promise.all([
      User.countDocuments({ role: 'user', createdAt: { $gte: sevenDaysAgo } }),
      Listing.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);
    const categoryStats = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const pendingReportsList = await Report.find({ status: 'pending' })
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('reportedListing', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: { total: totalUsers, active: activeUsers, blocked: blockedUsers, newThisWeek: newUsersWeek },
      listings: { total: totalListings, available: availableListings, sold: soldListings, hidden: hiddenListings, newThisWeek: newListingsWeek },
      reports: { total: totalReports, pending: pendingReports },
      categoryBreakdown: categoryStats,
      counts: {
        users: totalUsers,
        listings: totalListings,
        reports: totalReports,
        pendingReports: pendingReports,
        hiddenListings: hiddenListings,
      },
      userStatusCounts: {
        active: activeUsers,
        blocked: blockedUsers,
      },
      pendingReportsList,
    });
  } catch (error) {
    console.error('AdminStats Error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { search, status, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-password'),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('AdminGetUsers Error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @route GET /api/admin/users/:id
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('blockedUsers', 'name email avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const [listings, reports] = await Promise.all([
      Listing.find({ seller: req.params.id }).sort({ createdAt: -1 }),
      Report.find({ reportedUser: req.params.id }).populate('reporter', 'name email avatar').sort({ createdAt: -1 }),
    ]);
    res.json({ user, listings, reports });
  } catch (error) {
    console.error('AdminGetUserDetail Error:', error);
    res.status(500).json({ message: 'Server error fetching user detail' });
  }
};

// @route PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { status, adminNotes, restrictedUntil } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot modify another admin account.' });
    if (status) user.status = status;
    if (adminNotes !== undefined) user.adminNotes = adminNotes;
    if (restrictedUntil !== undefined) user.restrictedUntil = restrictedUntil;
    if (status === 'blocked' || status === 'restricted') user.warningCount += 1;
    await user.save();
    try {
      const msgMap = {
        blocked: 'Your account has been suspended by an administrator.',
        restricted: 'Your account has been restricted. Some features are temporarily unavailable.',
        active: 'Your account has been reactivated. Welcome back!',
      };
      if (msgMap[status]) {
        const notif = await Notification.create({
          recipient: user._id,
          type: 'admin',
          title: status === 'active' ? 'Account Reactivated' : 'Account Action Taken',
          message: msgMap[status],
          link: '/',
        });
        const io = req.app.get('socketio');
        if (io) io.to(user._id.toString()).emit('new_notification', notif);
      }
    } catch (e) { console.error('Admin notify error:', e); }
    res.json({ message: 'User status updated to ' + status, user });
  } catch (error) {
    console.error('AdminUpdateUserStatus Error:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete an admin account.' });
    await Promise.all([
      Listing.deleteMany({ seller: req.params.id }),
      Report.deleteMany({ $or: [{ reporter: req.params.id }, { reportedUser: req.params.id }] }),
      User.findByIdAndDelete(req.params.id),
    ]);
    res.json({ message: 'User and their listings deleted successfully.' });
  } catch (error) {
    console.error('AdminDeleteUser Error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @route GET /api/admin/listings
const getAllListings = async (req, res) => {
  try {
    const { search, category, status, isHidden, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (isHidden !== undefined) query.isHidden = isHidden === 'true';
    if (search) {
      query['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [listings, total] = await Promise.all([
      Listing.find(query).populate('seller', 'name email avatar').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Listing.countDocuments(query),
    ]);
    res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('AdminGetListings Error:', error);
    res.status(500).json({ message: 'Server error fetching listings' });
  }
};

// @route PATCH /api/admin/listings/:id/visibility
const toggleListingVisibility = async (req, res) => {
  try {
    const { isHidden, adminNote } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    listing.isHidden = isHidden;
    if (adminNote !== undefined) listing.adminNote = adminNote;
    await listing.save();
    res.json({ message: 'Listing visibility updated', listing });
  } catch (error) {
    console.error('AdminToggleVisibility Error:', error);
    res.status(500).json({ message: 'Server error toggling listing visibility' });
  }
};

// @route DELETE /api/admin/listings/:id
const deleteListingAdmin = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted by admin.' });
  } catch (error) {
    console.error('AdminDeleteListing Error:', error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
};

// @route GET /api/admin/reports
const getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'name email avatar')
        .populate('reportedUser', 'name email avatar status reportCount')
        .populate('reportedListing', 'title images status')
        .sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Report.countDocuments(query),
    ]);
    res.json({ reports, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('AdminGetReports Error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
};

// @route PATCH /api/admin/reports/:id
const resolveReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    report.status = status || report.status;
    report.adminNote = adminNote || report.adminNote;
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    await report.save();
    res.json({ message: 'Report updated', report });
  } catch (error) {
    console.error('AdminResolveReport Error:', error);
    res.status(500).json({ message: 'Server error resolving report' });
  }
};

// @route GET /api/admin/activity
const getRecentActivity = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentUsers, recentListings, recentReports] = await Promise.all([
      User.find({ role: 'user', createdAt: { $gte: sevenDaysAgo } }).select('name email avatar createdAt status').sort({ createdAt: -1 }).limit(10),
      Listing.find({ createdAt: { $gte: sevenDaysAgo } }).populate('seller', 'name avatar').sort({ createdAt: -1 }).limit(10),
      Report.find({ createdAt: { $gte: sevenDaysAgo } }).populate('reporter', 'name avatar').populate('reportedUser', 'name avatar').sort({ createdAt: -1 }).limit(10),
    ]);
    res.json({ recentUsers, recentListings, recentReports });
  } catch (error) {
    console.error('AdminGetActivity Error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
};

module.exports = {
  getDashboardStats, getAllUsers, getUserDetail, updateUserStatus, deleteUser,
  getAllListings, toggleListingVisibility, deleteListingAdmin,
  getAllReports, resolveReport, getRecentActivity,
};
