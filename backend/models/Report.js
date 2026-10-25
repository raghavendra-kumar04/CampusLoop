const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    default: null,
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'harassment', 'fake_listing', 'fraud', 'inappropriate_content', 'scam', 'other'],
  },
  description: {
    type: String,
    default: '',
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'actioned'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    default: '',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Report', reportSchema);
