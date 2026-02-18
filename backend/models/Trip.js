const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Trip Basic Info
  tripName: {
    type: String,
    required: [true, 'Trip name is required'],
    trim: true
  },
  
  destination: {
    name: {
      type: String,
      required: true
    },
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Trip Dates
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in days
    required: true
  },
  
  // Trip Status
  status: {
    type: String,
    enum: ['planning', 'booked', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  
  // Trip Type
  tripType: {
    type: String,
    enum: ['solo', 'couple', 'family', 'friends', 'business'],
    required: true
  },
  
  // Budget
  budget: {
    estimated: {
      type: Number,
      default: 0
    },
    actual: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Trip Members (for shared trips)
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    role: {
      type: String,
      enum: ['organizer', 'member'],
      default: 'member'
    },
    joinedAt: Date
  }],
  
  // Itinerary
  itinerary: [{
    day: Number,
    date: Date,
    activities: [{
      time: String,
      title: String,
      description: String,
      location: {
        name: String,
        address: String,
        coordinates: {
          latitude: Number,
          longitude: Number
        }
      },
      duration: String,
      cost: Number,
      bookingReference: String,
      notes: String
    }]
  }],
  
  // Associated Bookings
  bookings: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    bookingType: String,
    bookingReference: String,
    amount: Number
  }],
  
  // Places to Visit
  placesToVisit: [{
    placeId: String,
    name: String,
    type: String,
    priority: Number,
    visited: {
      type: Boolean,
      default: false
    },
    visitedDate: Date
  }],
  
  // Documents
  documents: [{
    title: String,
    type: {
      type: String,
      enum: ['passport', 'visa', 'ticket', 'voucher', 'insurance', 'other']
    },
    fileUrl: String,
    expiryDate: Date,
    notes: String
  }],
  
  // Packing List
  packingList: [{
    category: String,
    items: [{
      name: String,
      packed: {
        type: Boolean,
        default: false
      }
    }]
  }],
  
  // Notes
  notes: {
    type: String,
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  },
  
  // Photos
  photos: [{
    url: String,
    caption: String,
    uploadedAt: Date
  }],
  
  // Cover Image
  coverImage: String,
  
  // Privacy
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Trip Sharing
  sharedWith: [{
    email: String,
    sharedAt: Date
  }]
}, {
  timestamps: true
});

// Index for faster queries
tripSchema.index({ userId: 1, startDate: -1 });
tripSchema.index({ status: 1 });
tripSchema.index({ startDate: 1, endDate: 1 });

// Calculate duration before saving
tripSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);

