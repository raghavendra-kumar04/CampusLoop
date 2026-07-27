const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        // Validate that email ends with .edu or .ac.in
        return /\.edu$|\.ac\.in$/.test(v);
      },
      message: props => `${props.value} is not a valid campus email. You must register with a .edu or .ac.in email address.`,
    },
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Prevents showing password by default in queries
  },
  avatar: {
    type: String,
    default: '', // Will default to a letters-avatar or placeholder on frontend if empty
  },
  bio: {
    type: String,
    default: '',
    maxlength: 250,
  },
  major: {
    type: String,
    default: '',
  },
  graduationYear: {
    type: Number,
  },
  isVerified: {
    type: Boolean,
    default: true, // Auto-verified if they registered with .edu/.ac.in
  },
  rating: {
    type: Number,
    default: 0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
  savedItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    },
  ],
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
