const Report = require('../models/Report');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');

// @desc   Report a user
// @route  POST /api/reports/user/:id
// @access Private
const reportUser = async (req, res) => {
  try {
    const { reason, description, listingId } = req.body;
    const reporterId = req.user._id;
    const reportedUserId = req.params.id;

    if (reporterId.toString() === reportedUserId) {
      return res.status(400).json({ message: 'You cannot report yourself.' });
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) return res.status(404).json({ message: 'User not found' });

    // Check for duplicate report in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await Report.findOne({
      reporter: reporterId,
      reportedUser: reportedUserId,
      createdAt: { $gte: oneDayAgo },
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already reported this user recently. Our team will review it.' });
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUserId,
      reportedListing: listingId || null,
      reason,
      description: description || '',
    });

    // Increment report count on reported user
    await User.findByIdAndUpdate(reportedUserId, { $inc: { reportCount: 1 } });

    // Notify all admins
    try {
      const admins = await User.find({ role: 'admin' });
      const reporter = await User.findById(reporterId).select('name');
      for (const admin of admins) {
        const notif = await Notification.create({
          recipient: admin._id,
          sender: reporterId,
          type: 'report',
          title: 'New User Report',
          message: `${reporter.name} reported ${reportedUser.name} for: ${reason.replace('_', ' ')}`,
          link: '/admin',
        });
        const io = req.app.get('socketio');
        if (io) io.to(admin._id.toString()).emit('new_notification', notif);
      }
    } catch (e) { console.error('Report notify error:', e); }

    res.status(201).json({ message: 'Report submitted. Our team will review it shortly.', report });
  } catch (error) {
    console.error('ReportUser Error:', error);
    res.status(500).json({ message: 'Server error submitting report' });
  }
};

// @desc   Block a user
// @route  POST /api/users/:id/block
// @access Private
const blockUser = async (req, res) => {
  try {
    const blockerId = req.user._id;
    const blockedId = req.params.id;

    if (blockerId.toString() === blockedId) {
      return res.status(400).json({ message: 'You cannot block yourself.' });
    }

    const blocker = await User.findById(blockerId);
    const blocked = await User.findById(blockedId);
    if (!blocked) return res.status(404).json({ message: 'User not found' });

    if (blocker.blockedUsers.map(id => id.toString()).includes(blockedId)) {
      return res.status(400).json({ message: 'You have already blocked this user.' });
    }

    blocker.blockedUsers.push(blockedId);
    blocked.blockedBy.push(blockerId);
    await Promise.all([blocker.save(), blocked.save()]);

    res.json({ message: 'User blocked successfully.', blockedUserId: blockedId });
  } catch (error) {
    console.error('BlockUser Error:', error);
    res.status(500).json({ message: 'Server error blocking user' });
  }
};

// @desc   Unblock a user
// @route  POST /api/users/:id/unblock
// @access Private
const unblockUser = async (req, res) => {
  try {
    const blockerId = req.user._id;
    const blockedId = req.params.id;

    const blocker = await User.findById(blockerId);
    const blocked = await User.findById(blockedId);

    blocker.blockedUsers = blocker.blockedUsers.filter(id => id.toString() !== blockedId);
    if (blocked) {
      blocked.blockedBy = blocked.blockedBy.filter(id => id.toString() !== blockerId.toString());
      await blocked.save();
    }
    await blocker.save();

    res.json({ message: 'User unblocked successfully.', unblockedUserId: blockedId });
  } catch (error) {
    console.error('UnblockUser Error:', error);
    res.status(500).json({ message: 'Server error unblocking user' });
  }
};

// @desc   Get my blocked users list
// @route  GET /api/users/blocked
// @access Private
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('blockedUsers', 'name email avatar');
    res.json(user.blockedUsers);
  } catch (error) {
    console.error('GetBlockedUsers Error:', error);
    res.status(500).json({ message: 'Server error fetching blocked users' });
  }
};

// @desc   Get my filed reports
// @route  GET /api/reports/my
// @access Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate('reportedUser', 'name email avatar')
      .populate('reportedListing', 'title images')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error('GetMyReports Error:', error);
    res.status(500).json({ message: 'Server error fetching your reports' });
  }
};

module.exports = { reportUser, blockUser, unblockUser, getBlockedUsers, getMyReports };
