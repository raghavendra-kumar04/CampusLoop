const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [80, 'Title cannot exceed 80 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be 0 or greater'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['Electronics', 'Textbooks', 'Furniture', 'Dorm Gear', 'Clothing', 'Other'],
  },
  condition: {
    type: String,
    required: [true, 'Please specify the item condition'],
    enum: ['New', 'Mint', 'Used', 'Boxed', 'Good', 'Fair'],
  },
  listingType: {
    type: String,
    required: [true, 'Please specify listing type'],
    enum: ['Sell', 'Exchange', 'Donate'],
    default: 'Sell',
  },
  images: {
    type: [String],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'A listing must have at least one image',
    },
  },
  location: {
    type: String,
    required: [true, 'Please provide a meet-up location on/near campus'],
    trim: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Sold'],
    default: 'Available',
  },
}, {
  timestamps: true,
});

// Set text index for search functionality
listingSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
