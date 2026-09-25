const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const User = require('../models/User');

// @desc    Start or retrieve a conversation for a listing
// @route   POST /api/chats/start
// @access  Private
const startConversation = async (req, res) => {
  try {
    const { listingId, receiverId } = req.body;
    const senderId = req.user.id;

    if (!listingId || !receiverId) {
      return res.status(400).json({ message: 'Please provide listingId and receiverId' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot start a chat with yourself' });
    }

    // Enforce profile completeness (Major, Graduation Year, Bio) before buying / contacting sellers
    const senderUser = await User.findById(senderId);
    if (
      !senderUser ||
      !senderUser.major ||
      !senderUser.major.trim() ||
      !senderUser.graduationYear ||
      !senderUser.bio ||
      !senderUser.bio.trim()
    ) {
      return res.status(403).json({
        message: 'Profile Incomplete: You must complete your Major, Graduation Year, and Bio in your profile before contacting sellers or buying items.',
        code: 'PROFILE_INCOMPLETE',
      });
    }

    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if conversation already exists for this listing between these participants
    let conversation = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        listing: listingId,
      });
    }

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar major rating ratingsCount isVerified')
      .populate('listing', 'title price images status condition location');

    res.status(201).json(populated);
  } catch (error) {
    console.error('StartConversation Error:', error);
    res.status(500).json({ message: 'Server error starting conversation' });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/chats
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name avatar major rating ratingsCount isVerified')
      .populate('listing', 'title price images status condition location seller')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' }
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('GetConversations Error:', error);
    res.status(500).json({ message: 'Server error retrieving chats list' });
  }
};

// @desc    Get message history for a conversation
// @route   GET /api/chats/:id/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Verify user is participant in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(401).json({ message: 'Not authorized to view this chat' });
    }

    // Retrieve messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages sent by the other participant as read
    await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('GetMessages Error:', error);
    res.status(500).json({ message: 'Server error retrieving messages' });
  }
};

// @desc    Send a message (REST option - useful for image attachment uploads)
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const senderId = req.user.id;
    const { content } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.includes(senderId)) {
      return res.status(401).json({ message: 'Not authorized to post to this chat' });
    }

    let imageUrl = '';
    if (req.file) {
      if (req.file.path) {
        imageUrl = req.file.path; // Cloudinary URL
      } else {
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }
    }

    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'Cannot send an empty message' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content: content || '',
      image: imageUrl,
    });

    // Update conversation last message ref and timestamp
    conversation.lastMessage = message._id;
    await conversation.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    console.error('SendMessage Error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

module.exports = {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
};
