const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Search Type
  searchType: {
    type: String,
    enum: ['flight', 'hotel', 'train', 'bus', 'ride', 'place', 'weather', 'package'],
    required: true
  },
  
  // Search Parameters
  searchParams: {
    // Location data
    origin: {
      name: String,
      code: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    destination: {
      name: String,
      code: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    
    // Date data
    departureDate: Date,
    returnDate: Date,
    checkInDate: Date,
    checkOutDate: Date,
    
    // Travelers/Guests
    adults: {
      type: Number,
      default: 1
    },
    children: {
      type: Number,
      default: 0
    },
    infants: {
      type: Number,
      default: 0
    },
    rooms: {
      type: Number,
      default: 1
    },
    
    // Additional filters
    class: String,
    stops: String,
    priceRange: {
      min: Number,
      max: Number
    },
    amenities: [String],
    
    // Generic search query
    query: String
  },
  
  // Search Results Summary
  resultsCount: {
    type: Number,
    default: 0
  },
  
  // User clicked on result
  resultClicked: {
    type: Boolean,
    default: false
  },
  
  // User converted to booking
  convertedToBooking: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  // Device and Session Info
  deviceInfo: {
    type: String,
    userAgent: String,
    platform: String
  },
  
  // Search timestamp
  searchedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
searchHistorySchema.index({ userId: 1, searchedAt: -1 });
searchHistorySchema.index({ searchType: 1 });

// Automatically delete old search history (older than 90 days)
searchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('SearchHistory', searchHistorySchema);

