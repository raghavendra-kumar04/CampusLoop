const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: '',
    trim: true,
  },
  image: {
    type: String,
    default: '', // Cloudinary or Local uploads URL if an image is sent
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60 // 7 days in seconds (604800)
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
