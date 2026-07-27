const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const Notification = require('./models/Notification');

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload folders for local fallback
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Map REST API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Simple Healthcheck route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusLoop Server is active' });
});

// Configure Socket.io with authentication middleware
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_dev_key_123');
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Token invalid'));
  }
});

// Store active users and their socket IDs
const activeUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.userId;
  activeUsers.set(userId, socket.id);
  console.log(`User connected: ${userId} (Socket: ${socket.id})`);

  // Join a personal room to receive direct notifications
  socket.join(userId);

  // Join conversation chat room
  socket.on('join_chat', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave conversation chat room
  socket.on('leave_chat', (conversationId) => {
    socket.leave(conversationId);
    console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
  });

  // Typing status updates
  socket.on('typing', ({ conversationId, userName }) => {
    socket.to(conversationId).emit('user_typing', { conversationId, userName });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(conversationId).emit('user_stop_typing', { conversationId });
  });

  // Handle message sending (via socket)
  socket.on('send_message', async ({ conversationId, content, image }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        content: content || '',
        image: image || '',
      });

      // Update last message in Conversation
      conversation.lastMessage = message._id;
      await conversation.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name avatar');

      // Emit new message to all clients in conversation room
      io.to(conversationId).emit('new_message', populatedMessage);

      // Create in-app Notifications for other participants
      const otherParticipants = conversation.participants.filter(
        (p) => p.toString() !== userId
      );

      for (const recipientId of otherParticipants) {
        // Create DB notification
        const notification = await Notification.create({
          recipient: recipientId,
          sender: userId,
          type: 'chat',
          title: 'New Message',
          message: `${populatedMessage.sender.name} sent you a message: "${content ? content.substring(0, 30) : 'Sent an image'}"`,
          link: `/chat`, // Route on frontend client
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate('sender', 'name avatar');

        // Emit real-time notification to recipient's room
        io.to(recipientId.toString()).emit('new_notification', populatedNotification);
      }
    } catch (error) {
      console.error('Socket Send Message Error:', error);
    }
  });

  socket.on('disconnect', () => {
    activeUsers.delete(userId);
    console.log(`User disconnected: ${userId}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`CampusLoop MERN Server running on port ${PORT}`);
});
