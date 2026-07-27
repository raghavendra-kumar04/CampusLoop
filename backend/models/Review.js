const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating (1-5)'],
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: [true, 'Please write a review text'],
    trim: true,
    maxlength: 500,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

// Calculate average ratings and ratingsCount on User profile when a review is submitted
reviewSchema.statics.calculateAverageRating = async function (sellerId) {
  const stats = await this.aggregate([
    { $match: { seller: sellerId } },
    {
      $group: {
        _id: '$seller',
        averageRating: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('User').findByIdAndUpdate(sellerId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        ratingsCount: stats[0].numberOfRatings,
      });
    } else {
      await mongoose.model('User').findByIdAndUpdate(sellerId, {
        rating: 0,
        ratingsCount: 0,
      });
    }
  } catch (error) {
    console.error('Error updating user ratings: ', error);
  }
};

// Re-calculate average on save
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.seller);
});

module.exports = mongoose.model('Review', reviewSchema);
