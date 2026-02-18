const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Associated Booking (optional)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Review Type
  reviewType: {
    type: String,
    enum: ['hotel', 'flight', 'train', 'bus', 'place', 'attraction', 'restaurant', 'ride'],
    required: true
  },
  
  // Item being reviewed
  itemDetails: {
    externalId: String,
    name: {
      type: String,
      required: true
    },
    location: {
      city: String,
      country: String
    }
  },
  
  // Rating (1-5 stars)
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    
    // Sub-ratings
    cleanliness: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    },
    location: {
      type: Number,
      min: 1,
      max: 5
    },
    amenities: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Review Content
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  content: {
    type: String,
    required: true,
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },
  
  // Photos
  photos: [{
    url: String,
    caption: String
  }],
  
  // Trip Details
  visitDate: {
    type: Date,
    required: true
  },
  
  tripType: {
    type: String,
    enum: ['solo', 'couple', 'family', 'friends', 'business'],
    required: true
  },
  
  // Pros and Cons
  pros: [String],
  cons: [String],
  
  // Helpfulness
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },
  
  // User reactions
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['helpful', 'not-helpful']
    },
    reactedAt: Date
  }],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false // True if linked to actual booking
  },
  
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  moderationNotes: String,
  
  // Flags/Reports
  flags: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    flaggedAt: Date
  }],
  
  // Response from business/admin
  response: {
    content: String,
    respondedBy: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ reviewType: 1, 'rating.overall': -1 });
reviewSchema.index({ 'itemDetails.externalId': 1 });
reviewSchema.index({ status: 1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  if (total === 0) return 0;
  return Math.round((this.helpfulCount / total) * 100);
});

module.exports = mongoose.model('Review', reviewSchema);

